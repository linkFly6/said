using log4net;
using Said.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Filters
{
    /// <summary>
    /// 全局异常 filter
    /// </summary>
    public class GlobalHandleErrorAttribute : HandleErrorAttribute
    {

        private static readonly ILog logManager = LogManager.GetLogger(typeof(GlobalHandleErrorAttribute));

        /// <summary>
        /// 全局异常捕获
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnException(ExceptionContext filterContext)
        {
            StringBuilder sb = new StringBuilder("发生全局未捕获异常");
            sb.AppendFormat("\n【Url】{0}", filterContext.RequestContext.HttpContext.Request.Url);
            sb.AppendFormat("\n【Referrer】{0}", filterContext.RequestContext.HttpContext.Request.UrlReferrer);
            if (filterContext.RequestContext.HttpContext.Request.Headers != null)
            {
                sb.Append("\n【Header】");
                foreach (var key in filterContext.RequestContext.HttpContext.Request.Headers.AllKeys)
                {
                    sb.AppendFormat("\n   [{0}] {1}", key, filterContext.RequestContext.HttpContext.Request.Headers[key]);
                };
            }
            logManager.Error(sb.ToString(), filterContext.Exception);
        }
    }
}