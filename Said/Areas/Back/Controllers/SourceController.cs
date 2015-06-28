using PagedList;
//using PagedList;
using Said.Application;
using Said.Common;
using Said.Config;
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
    public class SourceController : BaseController
    {
        #region 上传一个文件
        // GET: /Source/
        /// <summary>
        /// 上传一个文件
        /// </summary>
        /// <param name="file">上传的文件</param>
        /// <param name="maxSize">接受的最大的文件大小</param>
        /// <param name="filters">可接受的扩展名</param>
        /// <param name="dirPath">要保存的路径（路径即可，文件名是自动生成的，注意路径最后要加斜杠）</param>
        /// <returns></returns>
        private JsonResult UploadFile(HttpPostedFileBase file, Array filters, int maxSize, string dirPath)
        {
            FileCommon.ExistsCreate(dirPath);
            if (file == null)
            {
                return UploadResult(1, "没有文件");
            }
            if (file.InputStream == null || file.InputStream.Length > maxSize)
            {
                return UploadResult(1, "上传文件大小超过限制");
            }
            //file.InputStream可以获取到System.io.Stream对象，由此可以对文件进行hash加密运算
            string fileName = file.FileName,
            fileExt = Path.GetExtension(fileName).ToLower();//扩展名
            if (string.IsNullOrEmpty(fileExt) || Array.IndexOf(filters, fileExt.Substring(1).ToLower()) == -1)
                return UploadResult(1, "上传文件扩展名是不允许的扩展名");
            string newFileName = string.Empty, //新生成的文件名
                   filePath = string.Empty;
            if (string.IsNullOrEmpty(dirPath))
                return UploadResult(1, "服务器异常");
            newFileName = FileCommon.CreateFileNameByTime() + fileExt;
            filePath = dirPath + newFileName;
            file.SaveAs(filePath);

            //分析上传的文件信息，返回解析得到的结果
            return UploadResult(0, "上传成功", newFileName);
        }
        #endregion


        #region 上传一个图片，保存并返回图片信息新生成的文件名
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
            FileCommon.ExistsCreate(dirPath);
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
            result.Add("code", "0");
            result.Add("name", newFileName);
            return result;
        }

        #endregion


        #region 上传歌曲
        /// <summary>
        /// 上传歌曲
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadMusic()
        {
            return UploadFile(Request.Files["uploadFile"],
                ConfigInfo.MusicFilterArray,
                ConfigInfo.SizeMusic,
                ConfigInfo.SourceMusicPath);
        }
        #endregion


        #region 上传类别Icon
        /// <summary>
        /// 上传类别Icon
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadClassifyIcons()
        {
            return UploadFile(
                Request.Files["uploadFile"],
                ConfigInfo.ImageFileterArray,
                ConfigInfo.SizeSaidImage,
                ConfigInfo.SourceIconsPath);
        }
        #endregion


        #region 获取图片
        /// <summary>
        /// 
        /// </summary>
        /// <param name="limit"></param>
        /// <param name="offset"></param>
        /// <param name="imgType">为空或为-1表示查询全部图片，否则查询指定类别的</param>
        /// <returns></returns>
        public JsonResult GetImagesList(int limit, int offset, string imgType = null)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            IPagedList<Image> res = null;
            if (string.IsNullOrEmpty(imgType) || imgType == "-1")
            {
                res = ImageApplication.FindToList(page);
            }
            else
            {
                ImageType imageType;
                if (Enum.TryParse<ImageType>(imgType, out imageType))
                {
                    //转换成功，查询类别
                    res = ImageApplication.FindToList(page, imageType);
                }
                else
                    res = ImageApplication.FindToList(page);//转换失败，查询全部
            }
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.TotalItemCount,
                datas = res.Select(m => new { id = m.ImageId, name = m.IName, img = m.IFileName, data = m.IFileName })
            }, JsonRequestBehavior.AllowGet);
        }
        #endregion


        #region 删除图片（逻辑删除）
        /// <summary>
        /// 删除图片（逻辑删除，修改isDelete，移动图片路径）
        /// </summary>
        /// <param name="id">image</param>
        /// <returns></returns>
        public JsonResult DeleteImage(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return ResponseResult(1, "没有数据");
            Image image = ImageApplication.Find(id);
            if (image == null)
                return ResponseResult(2, "没有找到图片");
            image.IsDel = 1;
            string path = string.Empty;
            switch (image.Type)
            {
                case ImageType.Blog:
                    path = ConfigInfo.SourceBlogPath;
                    break;
                case ImageType.Said:
                    path = ConfigInfo.SourceSaidPath;
                    break;
                case ImageType.System:
                case ImageType.Icon:
                case ImageType.Page:
                case ImageType.Lab:
                case ImageType.Other:
                default:
                    path = ConfigInfo.SourceSystemPath;
                    break;
            }
            FileCommon.Move(path + image.IFileName, string.Format("{0}${1}-${2}-${3}", ConfigInfo.SourceSystemDelete, image.ImageId, image.IFileName, image.Type));
            //更新到数据库，改动了isDel
            ImageApplication.Update(image);
            return ResponseResult();
        }
        #endregion


        #region 删除图片（物理删除）
        /// <summary>
        /// 删除图片（物理删除）
        /// </summary>
        /// <param name="id">image</param>
        /// <returns></returns>
        public JsonResult RealDeleteImage(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return ResponseResult(1, "没有数据");
            Image image = ImageApplication.Find(id);
            if (image == null)
                return ResponseResult(2, "没有找到图片");
            image.IsDel = 1;
            string path = string.Empty;
            switch (image.Type)
            {
                case ImageType.Blog:
                    path = ConfigInfo.SourceBlogPath;
                    break;
                case ImageType.Said:
                    path = ConfigInfo.SourceSaidPath;
                    break;
                case ImageType.System:
                case ImageType.Icon:
                case ImageType.Page:
                case ImageType.Lab:
                case ImageType.Other:
                default:
                    path = ConfigInfo.SourceSystemPath;
                    break;
            }
            FileCommon.Remove(path + image.IFileName);
            ImageApplication.Delete(image);
            return ResponseResult();
        }
        #endregion

        #region 资源中心的上传
        public JsonResult UploadSaidImage()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeSaidImage, ConfigInfo.SourceSaidPath, ImageType.Said);
        }

        public JsonResult UploadBlogImage()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeBlogImage, ConfigInfo.SourceBlogPath, ImageType.Blog);
        }

        public JsonResult UploadSystemImage()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeSystem, ConfigInfo.SourceSystemPath, ImageType.System);
        }

        public JsonResult UploadSongImage()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeSystem, ConfigInfo.SourceMusicImagePath, ImageType.Music);
        }

        #endregion


        #region 通用方法
        private JsonResult UploadResult(int code, string msg, string name = null)
        {
            return Json(new { code = code, msg = msg, name = name });
        }



        private JsonResult UploadImage(HttpPostedFileBase file, Array filters, int maxSize, string dirPath, ImageType type)
        {
            //分析上传的文件信息，返回解析得到的结果
            Dictionary<string, string> result = Save(file, ConfigInfo.ImageFileterArray, maxSize, dirPath);
            if (result["code"] == "1")
                return Json(new { code = 1, msg = result["msg"] });
            Image model = new Image
            {
                //TODO   -  UserID,ISize
                Date = DateTime.Now,
                IFileName = result["name"],
                Type = type,
                ImageId = Guid.NewGuid().ToString().Replace("-", ""),
                IName = result["name"]
            };
            if (ImageApplication.Add(model) > 0)
                return Json(new
                {
                    code = 0,
                    id = model.ImageId,
                    name = model.IFileName,
                    data = model.IFileName,
                    img = model.IFileName
                });
            return Json(new { code = 2, msg = "插入到数据库失败" });
        }
        #endregion


        public ActionResult Index()
        {
            return View();
        }

    }
}
