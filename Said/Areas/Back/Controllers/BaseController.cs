using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class BaseController : Controller
    {
        //这个控制器可以定义顶层控制器的行为

        
        public BaseController()
        {
            
        }

        

        #region Other

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功
        /// </summary>
        /// <returns></returns>
        protected JsonResult ResponseResult()
        {
            return Json(new { code = 0 });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功，并发送指定的数据
        /// </summary>
        /// <param name="data">发送的数据</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(object data)
        {
            return Json(new { code = 0, data = data });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="data">(如果有的话)发送的数据</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(int code, object data = null)
        {
            return Json(new { code = code, data = data });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(int code, string msg)
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
        protected JsonResult ResponseResult(int code, string msg, object data = null)
        {
            return Json(new { code = code, msg = msg, data = data });
        }

        #endregion
    }
}
