using Said.Application;
using Said.Controllers.Attrbute;
using Said.Helper;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Filters
{
    /// <summary>
    /// 版权
    /// </summary>
    public class CopyrightFilterAttribute : ActionFilterAttribute, IActionFilter
    {
        #region 过滤逻辑


        #endregion

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (HttpContext.Current.Request.Url.IsFile && (HttpContext.Current.Request.RawUrl.ToLower().Contains("/content/") || HttpContext.Current.Request.RawUrl.ToLower().Contains("/source/")))
            {
                Uri uri = HttpContext.Current.Request.Url;
                Uri referr = HttpContext.Current.Request.UrlReferrer;
                if (referr == null || Uri.Compare(uri, referr, UriComponents.HostAndPort, UriFormat.SafeUnescaped, StringComparison.CurrentCultureIgnoreCase) != 0)
                {
                    filterContext.Result = new FilePathResult("~/Content/said-copyright.png", "image/png");
                }
                else
                    base.OnActionExecuting(filterContext);
            }

        }
    }
}