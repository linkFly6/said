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
    public class AdminFilterAttribute : ActionFilterAttribute, IActionFilter
    {
        #region 过滤逻辑


        #endregion


        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            if (filterContext.ActionDescriptor.GetCustomAttributes(typeof(NoFilter), false).Length > 0)
            {
                //登录页不使用过滤器
                //TODO 检测一下有木有登录记录，有登录记录的话直接登录，否则放行
                return;
            }

            HttpContext context = HttpContext.Current;
            HttpCookie recordCookie = context.Request.Cookies["sh"];//said history=>Said登录历史
            string recordId = recordCookie == null ? null : recordCookie.Value;
            //System.Diagnostics.Debug.Write();
            //从缓存读，读不到再从数据库读

            if (string.IsNullOrEmpty(recordId))
            {
                //跳转到登录页
                filterContext.Result = new RedirectResult(string.Format("/Back/Home/Login?re={0}", System.Web.HttpUtility.UrlEncode(context.Request.RawUrl)));
                return;
            }
            //没有记录 && 从数据库读不到记录
            if (CacheHelper.GetCache(recordId) == null)
            {
                if (AdminRecordApplication.Get(recordId) != null)
                {
                    CacheHelper.SetCache(recordId, true);
                }
                else
                {

                    /*
                     *  跳转到登录页,RedirectResult参考这篇：http://www.cnblogs.com/artech/archive/2012/08/16/action-result-04.html
                     *  RedirectResult是暂时重定向，搜索引擎不会收录
                     */
                    filterContext.Result = new RedirectResult(string.Format("/Back/Home/Login?re={0}", System.Web.HttpUtility.UrlEncode(context.Request.RawUrl)));
                }
            }



        }
    }
}