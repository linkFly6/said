using PagedList;
using Said.Application;
using Said.Common;
using Said.Helper;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class MusicController : BaseController
    {
        //
        // GET: /Back/Music/

        public ActionResult Index()
        {
            return View();
        }

        #region 获取音乐
        /// <summary>
        /// 分页获取音乐
        /// </summary>
        /// <param name="limit">分页大小</param>
        /// <param name="offset">获取数据项的起点</param>
        /// <param name="keywords">查询关键字</param>
        /// <returns></returns>
        public JsonResult GetMusicList(int limit, int offset, string keywords = null)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            IPagedList<Song> res = null;
            if (string.IsNullOrWhiteSpace(keywords))
            {
                res = SongApplication.FindToList(page);
            }
            else
            {
                res = SongApplication.FindToList(page, keywords);
            }
            return Json(new
            {
                total = res.TotalItemCount,
                datas = res.ToList<Song>()
            }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 获取全部音乐
        /// </summary>
        /// <returns></returns>
        public JsonResult GetAllMusicList()
        {
            var res = SongApplication.Find().ToList<Song>();
            return Json(new
            {
                total = res.Count,
                datas = res
            }, JsonRequestBehavior.AllowGet);
        }
        #endregion



        #region 上传音乐
        /// <summary>
        /// 上传音乐
        /// </summary>
        /// <returns></returns>
        public JsonResult Upload()
        {
            return UploadMusic(Request.Files["uploadFile"], ConfigInfo.MusicFilterArray, ConfigInfo.SizeMusic, ConfigInfo.SourceMusicPath);
        }

        #endregion

        #region 添加音乐（提交音乐表单）
        /// <summary>
        /// 添加歌曲
        /// </summary>
        /// <param name="song">歌曲对象</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Add(Song model, string ReleaseDate)
        {
            string errorMsg = SongApplication.ValidateAndCorrectSubmit(model);
            if (errorMsg != null)
                return ResponseResult(1, errorMsg);
            if (string.IsNullOrWhiteSpace(ReleaseDate))
                return ResponseResult(1, "歌曲发行日期不正确");
            model.SongId = Guid.NewGuid().ToString().Replace("-", "");
            model.Date = DateTime.Now;
            model.SongLikeCount = 0;
            model.ReleaseDate = ConvertHelper.GetTime(ReleaseDate);
            return SongApplication.Add(model) > 0 ?
                ResponseResult(model.SongId) :
                ResponseResult(2, "插入到数据库失败");
        }
        #endregion


        #region 上传音乐通用

        #region 上传音乐文件
        /// <summary>
        /// 上传音乐文件
        /// </summary>
        /// <param name="file"></param>
        /// <param name="filters"></param>
        /// <param name="maxSize"></param>
        /// <param name="dirPath"></param>
        /// <returns></returns>
        private JsonResult UploadMusic(HttpPostedFileBase file, Array filters, int maxSize, string dirPath)
        {
            //分析上传的文件信息，返回解析得到的结果
            Dictionary<string, string> result = Save(file, ConfigInfo.MusicFilterArray, maxSize, dirPath);
            if (result["code"] == "1")
                return Json(new { code = 1, msg = result["msg"] });
            return ResponseResult(0, result["name"], result["data"]);
        }

        #endregion

        #region 上传一个文件，保存并返回文件信息新生成的文件名
        /// <summary>
        /// 上传一个图片，保存并返回图片信息新生成的文件名
        /// </summary>
        /// <param name="file"></param>
        /// <param name="filters"></param>
        /// <param name="maxSize"></param>
        /// <param name="dirPath"></param>
        /// <returns></returns>
        private Dictionary<string, string> Save(HttpPostedFileBase file, Array filters, int maxSize, string dirPath)
        {
            Dictionary<string, string> result = new Dictionary<string, string>();
            dirPath = Server.MapPath(dirPath);
            //FileCommon.ExistsCreate(dirPath);
            if (file == null)
            {
                result.Add("code", "1");
                result.Add("msg", "没有文件");
                return result;
            }
            if (file.InputStream == null || file.InputStream.Length > maxSize)
            {
                result.Add("code", "1");
                result.Add("msg", "上传文件大小超过限制");
                return result;
            }
            //file.InputStream可以获取到System.io.Stream对象，由此可以对文件进行hash加密运算
            string fileName = file.FileName,
            fileExt = Path.GetExtension(fileName).ToLower();//扩展名
            if (string.IsNullOrEmpty(fileExt) || Array.IndexOf(filters, fileExt.Substring(1).ToLower()) == -1)
            {
                result.Add("code", "1");
                result.Add("msg", "上传文件扩展名是不允许的扩展名");
                return result;
            }
            string newFileName = string.Empty, //新生成的文件名
                   filePath = string.Empty;
            if (string.IsNullOrEmpty(dirPath))
            {
                result.Add("code", "1");
                result.Add("msg", "服务器异常");
                return result;
            }


            newFileName = FileCommon.CreateFileNameByTime() + fileExt;
            filePath = dirPath + newFileName;
            file.SaveAs(filePath);

            //TODO 这里需要检测有没有什么异常
            MusicInfo music = MusicCommon.GetFileInfo(filePath);
            music.Size = file.ContentLength;
            music.Type = fileExt.Substring(1);
            //if (string.IsNullOrEmpty(music.Length))
            //{
            //    //测试了10个左右的文件，发现木有音乐文件长度不存在的情况
            //    if (music.BitRate == 0)
            //    {
            //        result.Add("code", "2");
            //        result.Add("msg", "文件异常（无法读取到正确的文件信息）");
            //        return result;
            //    }
            //    else
            //    {
            //        //尝试转换
            //        //这里得到的是字节么？
            //        music.Length = (music.Size * 1024 / music.BitRate * 8).ToString();  //歌曲时长 = 文件大小（mb）/ 位率（KBPS） * 8
            //        System.Diagnostics.Debug.WriteLine(music.Length);
            //    }
            //}


            result.Add("code", "0");
            result.Add("path", filePath);
            result.Add("dir", dirPath);
            result.Add("name", newFileName);
            result.Add("data", JavaScriptCommon.Serialize(music));
            return result;
        }

        #endregion
        #endregion

        #region 删除音乐（物理删除）
        /// <summary>
        /// 删除图片（物理删除）
        /// </summary>
        /// <param name="id">image</param>
        /// <returns></returns>
        public JsonResult RealDeleteMusic(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return ResponseResult(1, "没有数据");
            Song model = SongApplication.Find(id);
            if (model == null)
                return ResponseResult(2, "没有找到音乐对象");
            FileCommon.Remove(Server.MapPath(ConfigInfo.SourceMusicPath + model.SongFileName));
            SongApplication.Delete(model);
            return ResponseResult();
        }
        #endregion


        #region 删除文件（物理删除）
        /// <summary>
        /// 删除图片（物理删除）
        /// </summary>
        /// <param name="id">image</param>
        /// <returns></returns>
        public JsonResult RealDeleteFile(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ResponseResult(1, "没有数据");
            FileCommon.Remove(Server.MapPath(ConfigInfo.SourceMusicPath + fileName));
            return ResponseResult();
        }
        #endregion
    }
}
