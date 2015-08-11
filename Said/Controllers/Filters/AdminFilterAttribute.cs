using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Filters
{
    public class AdminFilterAttribute : ActionFilterAttribute, IActionFilter
    {
        #region 过滤逻辑


        #endregion


        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext context = HttpContext.Current;
            HttpCookie recordCookie = context.Request.Cookies["sh"];//said history=>Said登录历史

            System.Diagnostics.Debug.Write(recordCookie);

            //从缓存读，读不到再从数据库读
            base.OnActionExecuting(filterContext);
        }
    }
}