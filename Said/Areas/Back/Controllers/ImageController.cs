using PagedList;
using Said.Application;
using Said.Common;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class ImageController : BaseController
    {
        //
        // GET: /Back/Image/

        public ActionResult Index()
        {
            return View();
        }




        #region 获取图片
        /// <summary>
        /// 分页获取图片图片
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



        #region 上传不同的分类图片
        public JsonResult Upload()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeSystem, ConfigInfo.SourceSystemPath, ConfigInfo.SourceSystemThumbnailPath, ImageType.Said);
        }


        /// <summary>
        /// 上传图片
        /// </summary>
        /// <param name="type">图片类型</param>
        /// <returns></returns>
        public JsonResult Upload(ImageType type)
        {
            string resourcePath = string.Empty,
                   thumbnailPath = string.Empty;
            int maxSize = 102400;
            switch (type)
            {
                case ImageType.Blog:
                    {
                        maxSize = ConfigInfo.SizeBlogImage;
                        resourcePath = ConfigInfo.SourceBlogPath;
                        thumbnailPath = ConfigInfo.SourceBlogThumbnailPath;
                    }
                    break;
                case ImageType.Music:
                    {
                        maxSize = ConfigInfo.SizeMusic;
                        resourcePath = ConfigInfo.SourceMusicImagePath;
                        thumbnailPath = ConfigInfo.SourceMusicThumbnailPath;
                    }
                    break;
                case ImageType.Said:
                    {
                        maxSize = ConfigInfo.SizeSaidImage;
                        resourcePath = ConfigInfo.SourceSaidPath;
                        thumbnailPath = ConfigInfo.SourceSaidThumbnailPath;
                    }
                    break;
                case ImageType.Icon://ICON不需要生成缩略图
                    {
                        maxSize = ConfigInfo.SizeIcons;
                        resourcePath = ConfigInfo.SourceIconsPath;
                    }
                    break;
                //case ImageType.System:
                //case ImageType.Page:
                //case ImageType.Lab:
                //case ImageType.Other:
                default:
                    {
                        maxSize = ConfigInfo.SizeSystem;
                        resourcePath = ConfigInfo.SourceSystemPath;
                        thumbnailPath = ConfigInfo.SourceSystemThumbnailPath;
                    }
                    break;
            }
            //分析上传的文件信息，返回解析得到的结果
            return UploadImage(Request.Files["uploadFile"], ConfigInfo.ImageFileterArray, ConfigInfo.SizeSaidImage, ConfigInfo.SourceSaidPath, thumbnailPath, ImageType.Said);
        }
        #endregion




        #region 上传图片通用

        #region 上传图片
        /// <summary>
        /// 上传图片
        /// </summary>
        /// <param name="file"></param>
        /// <param name="filters"></param>
        /// <param name="maxSize"></param>
        /// <param name="dirPath"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        private JsonResult UploadImage(HttpPostedFileBase file, Array filters, int maxSize, string dirPath, string thumbnailPath, ImageType type)
        {
            //分析上传的文件信息，返回解析得到的结果
            Dictionary<string, string> result = Save(file, ConfigInfo.ImageFileterArray, maxSize, dirPath);
            int intImageType = (int)type;
            if (result["code"] == "1")
                return Json(new { code = 1, msg = result["msg"] });
            //裁剪图片
            var isCurOk = ImageCommon.CutImg(result["path"]);
            if (!isCurOk)
            {
                return Json(new { code = 3, msg = "裁剪图片失败" });
            }
            //Icon图不需要生成缩略图
            if (intImageType < 4 || intImageType > 6)//[4:Icon,5:Page,6:Lab]不需要生成缩略图
            {
                isCurOk = ImageCommon.MakeThumbnail(result["path"], Server.MapPath(thumbnailPath + result["name"]));
                if (!isCurOk)
                {
                    return Json(new { code = 4, msg = "生成缩略图失败" });
                }
            }


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
            result.Add("code", "0");
            result.Add("path", filePath);
            result.Add("dir", dirPath);
            result.Add("name", newFileName);
            return result;
        }

        #endregion
        #endregion
    }
}
