using Said.Application;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class HomeController : BaseController
    {
        //
        // GET: /Back/

        public ActionResult Index()
        {
            return View();
        }



        #region Logic
        /// <summary>
        /// 检测歌曲文件名是否已经存在
        /// </summary>
        /// <returns></returns>
        public JsonResult ExistsSongFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ResponseResult(1, "不是合法的文件名");
            var res = SongApplication.FindByFileName(fileName.Trim());
            if (res != null)
                return ResponseResult(2, "存在重复项", new { name = res.SongName });
            return ResponseResult();
        }

        /// <summary>
        /// 检测Said文件名是否已经存在
        /// </summary>
        /// <returns></returns>
        public JsonResult ExistsSaidFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ResponseResult(1, "不是合法的文件名");
            var res = ArticleApplication.FindByFileName(fileName.Trim());
            if (res != null)
                return ResponseResult(2, "存在重复项", new { name = res.STitle });
            return ResponseResult();
        }
        #endregion



    }
}
