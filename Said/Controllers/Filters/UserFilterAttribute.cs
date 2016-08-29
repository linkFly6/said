using Said.Common;
using Said.Controllers.Attrbute;
using System.Web;
using System.Web.Mvc;


namespace Said.Controllers.Filters
{
    public class UserFilterAttribute : ActionFilterAttribute, IActionFilter
    {

        /// <summary>
        /// 加载action前
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.ActionDescriptor.GetCustomAttributes(typeof(NoFilter), false).Length == 0)
            {
                //启用noFilter特性的不统计

                SaidRecordCommon.Add(HttpContext.Current);
                SaidRecordCommon.SetAdmindId(HttpContext.Current);
            }
            base.OnActionExecuting(filterContext);
        }

        /// <summary>
        /// 加载action后
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            base.OnActionExecuted(filterContext);
        }


        /// <summary>
        /// 在action返回前执行
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            base.OnResultExecuting(filterContext);
        }

        /// <summary>
        /// 在action方法返回后执行
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);
        }

    }
}