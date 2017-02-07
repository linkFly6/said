using log4net;
using Said.Common;
using Said.Helper;
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
            sb.AppendFormat("{1}【Url】{0}", filterContext.RequestContext.HttpContext.Request.Url, Environment.NewLine);
            sb.AppendFormat("{1}【Referrer】{0}", filterContext.RequestContext.HttpContext.Request.UrlReferrer, Environment.NewLine);
            if (filterContext.RequestContext.HttpContext.Request.Headers != null)
            {
                sb.AppendFormat("{1}【Header】", Environment.NewLine);
                foreach (var key in filterContext.RequestContext.HttpContext.Request.Headers.AllKeys)
                {
                    sb.AppendFormat("{2}   [{0}] {1}", key, filterContext.RequestContext.HttpContext.Request.Headers[key], Environment.NewLine);
                };
            }
            sb.AppendFormat("{1}【IP】{0}", HttpHelper.GetIP(HttpContext.Current), Environment.NewLine);
            logManager.Error(sb.ToString(), filterContext.Exception);
        }
    }
}