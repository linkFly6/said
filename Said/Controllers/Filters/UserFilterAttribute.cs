using Said.Application;
using Said.Helper;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Mvc;


namespace Said.Controllers.Filters
{
    public class UserFilterAttribute : ActionFilterAttribute, IActionFilter
    {

        #region 统计逻辑
        /// <summary>
        /// 线程锁
        /// </summary>
        private static readonly object @lock = new object();
        /*
         * IP地址：http://gghaomm.iteye.com/blog/1748038
         * ip.taobao.com/instructions.php?ip=[ip地址字串] 
         * {"code":0,"data":{"ip":"210.75.225.254","country":"\u4e2d\u56fd","area":"\u534e\u5317",
            "region":"\u5317\u4eac\u5e02","city":"\u5317\u4eac\u5e02","county":"","isp":"\u7535\u4fe1",
            "country_id":"86","area_id":"100000","region_id":"110000","city_id":"110000",
            "county_id":"-1","isp_id":"100017"}}
         * 
         */
        /// <summary>
        /// 根据IP获取地址
        /// </summary>
        /// <param name="ip">ip地址</param>
        /// <returns>返回一个长度为3的数组，分别表示：[国家,省份,城市]</returns>
        private string[] GetAddress(string ip)
        {
            if (string.IsNullOrEmpty(ip))
                return new string[3] { "", "", "" };
            //return await Task.Run<string[]>(() =>
            //{
            //    lock (@lock)
            //    {
            string result = HttpHelper.GetAddress(ip);
            if (string.IsNullOrEmpty(result) || !result.Contains("-"))
                return new string[3] { "", "", "" };
            return result.Split('-');
            //    }
            //});
        }


        /// <summary>
        /// 添加统计记录方法
        /// </summary>
        /// <param name="userId">添加记录的用户ID</param>
        /// <param name="context">收集信息的httpContext上下文</param>
        private void AddRecord(string userId, HttpContext context)
        {
            //收集统计信息
            var helper = new HttpHelper(context);
            string key = context.Request["sgs"];
            if (key == null)
                key = string.Empty;
            UserRecord record = new UserRecord
            {
                Date = DateTime.Now,
                Browser = helper.GetBrowser(),
                IP = helper.GetIP(),
                Language = helper.GetLangage(),
                Key = key,//【【【【【【【【【【【【TODO 这个key是点击参数里的】】】】】】】】】】】】】
                OS = helper.GetClientOS(),
                SessionID = context.Session.SessionID,
                Query = context.Request.Url.Query,
                SpiderName = helper.GetSpiderBot(),
                UserID = userId,
                UserAgent = context.Request.UserAgent,
                UrlReferrer = string.Empty,
                ReferrerAuthority = string.Empty,
                LocalPath = context.Request.Url.LocalPath,
                IsFile = context.Request.Url.IsFile
            };
            if (context.Request.UrlReferrer != null)
            {
                record.UrlReferrer = context.Request.UrlReferrer.AbsolutePath;
                record.ReferrerAuthority = context.Request.UrlReferrer.Authority;
            }

            //异步根据IP获取地址
            Task.Run(() =>
            {
                lock (@lock)
                {
                    string[] address = GetAddress(record.IP);
                    //string[] address = GetAddress("124.127.118.59");
                    record.Country = address[0];
                    record.Province = address[1];
                    record.City = address[2];
                    UserRecordApplication.Add(record);
                }
            });

        }

        /// <summary>
        /// 统计方法
        /// </summary>
        /// <param name="context"></param>
        private void Statistics(HttpContext context)
        {
            HttpCookie cookie = context.Request.Cookies.Get("uid");
            string userId = string.Empty;
            if (cookie == null || cookie.Value == null)//没有用户ID，创建
            {
                cookie = new HttpCookie("uid");
                User user = new User { UserID = userId = Guid.NewGuid().ToString().Replace("-", ""), EMail = string.Empty, Name = string.Empty, Date = DateTime.Now };
                if (UserApplication.Add(user) > 0)
                {
                    cookie.Name = "uid";
                    cookie.Value = userId;
                    //cookie.Values.Add("id", userId);
                    cookie.Path = "/";
                    cookie.Expires = DateTime.Now.AddYears(1);
                    context.Response.Cookies.Add(cookie);
                }
            }
            else
            {
                userId = cookie.Value;//【【【【【【【【【【【TODO： 这里要验证cookie的合法性】】】】】】】】】】
            }
            context.Session["userId"] = userId;
            AddRecord(userId, context);
        }
        #endregion

        /// <summary>
        /// 加载action前
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Statistics(HttpContext.Current);
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