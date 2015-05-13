using Said.Common;
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
        //【【【TODO 这些常量都得可以配置】】】
        #region Other
        /// <summary>
        /// 图片过滤
        /// </summary>
        readonly static Array IMGFILTERARRAY = "gif,jpg,jpeg,png,bmp".Split(',');
        /// <summary>
        /// 图片最大容量（1mb）
        /// </summary>
        int imgMaxSize = 1048576;
        /// <summary>
        /// 音乐文件过滤
        /// </summary>
        readonly static Array MUSICFILTERARRAY = "mp3,ogg".Split(',');
        /// <summary>
        /// 音乐最大容量（6mb）
        /// </summary>
        int musicMaxSize = 6291456;
        #endregion



        // GET: /Source/
        /// <summary>
        /// 上传一个文件方法
        /// </summary>
        /// <param name="file">上传的文件</param>
        /// <param name="maxSize">接受的最大的文件大小</param>
        /// <param name="filters">可接受的扩展名</param>
        /// <param name="dirPath">要保存的路径（路径即可，文件名是自动生成的，注意路径最后要加斜杠）</param>
        /// <returns></returns>
        private JsonResult UploadFile(HttpPostedFileBase file, Array filters, int maxSize, string dirPath)
        {
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


        /// <summary>
        /// 上传Said图片
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadSaidImg()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadFile(Request.Files["uploadFile"], IMGFILTERARRAY, imgMaxSize, FileCommon.ExistsCreate(Server.MapPath("~/Source/Said/Images/")));
        }


        /// <summary>
        /// 上传Said图片
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadBlogImg()
        {
            //分析上传的文件信息，返回解析得到的结果
            return UploadFile(Request.Files["uploadFile"], IMGFILTERARRAY, imgMaxSize, FileCommon.ExistsCreate(Server.MapPath("~/Source/Blog/Images/")));
        }


        /// <summary>
        /// 上传歌曲
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadMusic()
        {
            return UploadFile(Request.Files["uploadFile"],
                MUSICFILTERARRAY,
                musicMaxSize,
                FileCommon.ExistsCreate(Server.MapPath("~/Source/Said/Musics/")));
        }


        /// <summary>
        /// 上传类别Icon
        /// </summary>
        /// <returns></returns>
        public JsonResult UploadClassifyIcons()
        {
            return UploadFile(
                Request.Files["uploadFile"],
                IMGFILTERARRAY,
                imgMaxSize,
                FileCommon.ExistsCreate(Server.MapPath("~/Source/Sys/Images/Icons/")));
        }

        #region 通用方法
        private JsonResult UploadResult(int code, string msg, string name = null)
        {
            return Json(new { code = code, msg = msg, name = name });
        }
        #endregion


        public ActionResult Index()
        {
            return View();
        }

    }
}
