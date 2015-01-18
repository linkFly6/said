using Said.Application;
using Said.Common;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Back
{
    public class BackController : Controller
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

        #region Other

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功
        /// </summary>
        /// <returns></returns>
        private JsonResult ResponseResult()
        {
            return Json(new { code = 0 });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <returns></returns>
        private JsonResult ResponseResult(int code)
        {
            return Json(new { code = code });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <returns></returns>
        private JsonResult ResponseResult(int code, string msg)
        {
            return Json(new { code = code, msg = msg });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息、错误数据
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <param name="data">错误数据</param>
        /// <returns></returns>
        private JsonResult ResponseResult(int code, string msg, object data = null)
        {
            return Json(new { code = code, msg = msg, data = data });
        }

        #endregion
    }
}
