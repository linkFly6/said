using Said.Common;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    public class SourceController : Controller
    {
        readonly static Array IMGFILTERARRAY = "gif,jpg,jpeg,png,bmp".Split(',');
        /// <summary>
        /// 图片过滤
        /// </summary>
        readonly static IList IMGFILTERS = ArrayList.Adapter(IMGFILTERARRAY);
        /// <summary>
        /// 图片最大容量
        /// </summary>
        int imgMaxSize = 1000000;
        //
        // GET: /Source/
        public JsonResult UploadSong()
        {

            return Json(new { });
        }

        public JsonResult UploadSaidImg()
        {
            HttpPostedFileBase file = Request.Files["saidImg"];
            if (file == null)
            {
                return UploadResult(1, "没有文件");
            }
            if (file.InputStream == null || file.InputStream.Length > imgMaxSize)
            {
                return UploadResult(1, "上传文件大小超过限制");
            }
            //file.InputStream可以获取到System.io.Stream对象，由此可以对文件进行hash加密运算
            string fileName = file.FileName,
            fileExt = Path.GetExtension(fileName).ToLower();//扩展名
            if (string.IsNullOrEmpty(fileExt) || Array.IndexOf(IMGFILTERARRAY, fileExt.Substring(1).ToLower()) == -1)
                return UploadResult(1, "上传文件扩展名是不允许的扩展名");
            //文件保存的目录
            string dirPath = FileCommon.ExistsCreate(Server.MapPath("~/Source/Said/")),
                newFileName = string.Empty, //新生成的文件名
                filePath = string.Empty;
            if (string.IsNullOrEmpty(dirPath))
                return UploadResult(1, "服务器异常");
            newFileName = DateTime.Now.ToString("yyyyMMddHHmmss_ffff", DateTimeFormatInfo.InvariantInfo) + fileExt;
            filePath = dirPath + newFileName;
            file.SaveAs(filePath);

            //分析上传的文件信息，返回解析得到的结果

            return UploadResult(0, "上传成功", newFileName);
        }
        public ActionResult Index()
        {
            return View();
        }


        #region 通用方法
        private JsonResult UploadResult(int errorCode, string msg, string url = null)
        {
            return Json(new { error = errorCode, msg = msg, url = url });
        }
        #endregion
    }
}
