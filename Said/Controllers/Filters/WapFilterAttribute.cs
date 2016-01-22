using System.Web;
using System.Web.Http.Controllers;
using System.Web.Mvc;

namespace Said.Controllers.Filters
{
    /// <summary>
    /// 移动版页面过滤器（对应的是web版页面过滤器）
    /// </summary>
    public class WapFilterAttribute : ActionFilterAttribute, IActionFilter
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            string requestPath = HttpContext.Current.Request.Url.PathAndQuery;
            //var temp = new System.Web.Routing.RouteValueDictionary();
            //temp.Add("action", filterContext.RouteData.Values["action"].ToString());
            //temp.Add("controller", filterContext.RouteData.Values["controller"].ToString());
            //temp.Add("area", "wap");
            //filterContext.Result = new RedirectToRouteResult(temp);

            //重定向到wap页
            //if (filterContext.RouteData.Values.ContainsKey("area"))
            //{
            //    filterContext.RouteData.Values["area"] = "wap";
            //}
            //else
            //    filterContext.RouteData.Values.Add("area", "wap");
            ////把所有参数都带过去
            //filterContext.Result = new RedirectToRouteResult(filterContext.RouteData.Values);

            base.OnActionExecuting(filterContext);
        }
    }
}