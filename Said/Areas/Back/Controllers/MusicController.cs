using PagedList;
using Said.Application;
using Said.Common;
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
            return UploadMusic(Request.Files["uploadFile"], ConfigInfo.MusicFilterArray, ConfigInfo.SizeMusic, ConfigInfo.SourceMusicImagePath);
        }

        #endregion

        #region 添加音乐（提交音乐表单）
        public JsonResult Add(Song model)
        {
            string errorMsg = SongApplication.ValidateAndCorrectSubmit(model);
            if (errorMsg != null)
                return ResponseResult(1, errorMsg);
            model.SongId = Guid.NewGuid().ToString().Replace("-", "");
            model.Date = DateTime.Now;
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
            Dictionary<string, string> result = Save(file, ConfigInfo.ImageFileterArray, maxSize, dirPath);
            if (result["code"] == "1")
                return Json(new { code = 1, msg = result["msg"] });
            return ResponseResult(result["name"]);
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

            //这里是调试
            string test = MusicCommon.GetFileInfo(filePath);

            System.Diagnostics.Debug.Write(test);



            result.Add("code", "0");
            result.Add("path", filePath);
            result.Add("dir", dirPath);
            result.Add("name", newFileName);
            return result;
        }

        #endregion
        #endregion


        #region 删除图片（物理删除）
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
            FileCommon.Remove(ConfigInfo.SourceMusicPath + model.SongFileName);
            SongApplication.Delete(model);
            return ResponseResult();
        }
        #endregion
    }
}
