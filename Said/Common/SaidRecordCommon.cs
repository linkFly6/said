using Said.Application;
using Said.Helper;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// Said用户记录统计类
    /// </summary>
    public class SaidRecordCommon
    {
        /// <summary>
        /// 统计关键词的参数
        /// </summary>
        public static readonly string KEY = "sgs";

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
        public static string[] GetAddress(string ip)
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
        /// 设置管理员信息，如果当前用户是管理员的话，则给session的adminId设置为管理员ID，否则不设置session
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public static void SetAdmindId(HttpContext context)
        {
            if (context.Session["adminId"] != null) return;
            HttpCookie recordCookie = context.Request.Cookies["sh"];//said history=>Said登录历史

            string recordId = recordCookie == null ? null : recordCookie.Value;
            if (!string.IsNullOrEmpty(recordId))
            {//管理员访问历史cookie存在
                AdminRecord record = CacheHelper.GetCache(recordId) as AdminRecord;//检测cache是否有
                if (record == null)
                {
                    record = AdminRecordApplication.Get(recordId);//从数据库查询
                    if (record != null)//从cookie中查出来了，放入cache
                    {
                        CacheHelper.SetCache(recordId, record.Admin);
                        //更新到Session
                        context.Session["adminId"] = record.AdminId;
                        //return record.AdminId;
                    }
                }
                else {
                    //return record.AdminId;
                    context.Session["adminId"] = record.AdminId;
                }
            }
            //return null;

        }


        /// <summary>
        /// 获取当前回话的用户ID，如果没有用户ID，则会创建一个用户ID
        /// </summary>
        /// <param name="context">请求上下文</param>
        /// <returns></returns>
        public static string GetUserId(HttpContext context)
        {
            HttpCookie cookie = context.Request.Cookies.Get("uid");
            string userId = string.Empty;
            if (cookie == null || cookie.Value == null || !UserApplication.Exists(cookie.Value))//没有用户ID，并且验证cookie合法 => 用户id是否存在，否则直接创建一个
            {//
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
                userId = cookie.Value;
            }
            context.Session["userId"] = userId;
            return userId;
        }



        #region 添加统计信息
        /// <summary>
        /// 添加统计记录方法，会自动识别IP并转换成相应的区域
        /// </summary>
        /// <param name="key">统计的标记（关键词）</param>
        /// <param name="record">统计信息对象</param>
        public static void AddRecord(UserRecord record)
        {
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
        /// 添加统计记录方法
        /// </summary>
        /// <param name="userId">添加记录的用户ID</param>
        /// <param name="context">收集信息的httpContext上下文</param>
        public static void AddRecord(HttpContext context)
        {
            //收集统计信息
            var helper = new HttpHelper(context);
            string key = context.Request[KEY];
            if (string.IsNullOrWhiteSpace(key))
                key = string.Empty;
            UserRecord record = new UserRecord
            {
                Date = DateTime.Now,
                Browser = helper.GetBrowser(),
                IP = helper.GetIP(),
                Language = helper.GetLangage(),
                Key = key,
                OS = helper.GetClientOS(),
                SessionID = context.Session.SessionID,
                Query = HttpUtility.UrlDecode(context.Request.Url.Query),
                SpiderName = helper.GetSpiderBot(),
                //获取当前会话用户ID
                UserID = GetUserId(context),
                UserAgent = context.Request.UserAgent,
                UrlReferrer = string.Empty,
                ReferrerAuthority = string.Empty,
                //LocalPath = context.Request.Url.AbsoluteUri,//绝对uri，参考：http://www.cnblogs.com/kissdodog/archive/2013/04/22/3034898.html
                LocalPath = context.Request.Url.OriginalString,//原始uri
                IsFile = context.Request.Url.IsFile
            };
            if (context.Request.UrlReferrer != null)
            {
                record.UrlReferrer = context.Request.UrlReferrer.OriginalString;
                record.ReferrerAuthority = context.Request.UrlReferrer.Authority;
            }
            AddRecord(record);
        }
        #endregion


        #region 统计API

        /// <summary>
        /// 统计方法，自动根据上下文进行统计
        /// </summary>
        /// <param name="context"></param>
        public static void Add(HttpContext context)
        {
            AddRecord(context);
        }


        /// <summary>
        /// 统计方法，根据配置的参数项进行统计
        /// </summary>
        /// <param name="context">要统计的请求上下文</param>
        /// <param name="key">要统计的关键词（统计词）</param>
        /// <param name="url">请求的url</param>
        /// <param name="urlReferrer">该请求的来源url</param>
        public static void Add(HttpContext context, string key, Uri requestUrl, Uri urlReferrer)
        {
            var helper = new HttpHelper();
            UserRecord record = new UserRecord
            {
                Date = DateTime.Now,
                Browser = helper.GetBrowser(),
                IP = helper.GetIP(),
                Language = helper.GetLangage(),
                Key = key,
                OS = helper.GetClientOS(),
                SessionID = context.Session.SessionID,
                Query = requestUrl.Query,
                SpiderName = helper.GetSpiderBot(),
                //获取当前会话用户ID
                UserID = GetUserId(HttpContext.Current),
                UserAgent = context.Request.UserAgent,
                UrlReferrer = string.Empty,
                ReferrerAuthority = string.Empty,
                //LocalPath = context.Request.Url.AbsoluteUri,//绝对uri，参考：http://www.cnblogs.com/kissdodog/archive/2013/04/22/3034898.html
                LocalPath = requestUrl.OriginalString,//原始uri
                IsFile = false
            };
            if (urlReferrer != null)
            {
                record.UrlReferrer = urlReferrer.OriginalString;
                record.ReferrerAuthority = urlReferrer.Authority;
            }
            AddRecord(record);
        }


        /// <summary>
        /// 统计方法，统计一个错误跳转的url，根据配置的参数项进行统计，并不统计例如参数之类的东西
        /// </summary>
        /// <param name="context">要统计的请求上下文</param>
        /// <param name="key">要统计的关键词（统计词）</param>
        /// <param name="url">请求的url字符串</param>
        /// <param name="urlReferrer">该请求的来源url</param>
        public static void AddFail(string key, string requestUrl, string urlReferrer = null)
        {
            var helper = new HttpHelper();
            UserRecord record = new UserRecord
            {
                Date = DateTime.Now,
                Browser = helper.GetBrowser(),
                IP = helper.GetIP(),
                Language = helper.GetLangage(),
                Key = key,
                OS = helper.GetClientOS(),
                SessionID = HttpContext.Current.Session.SessionID,
                Query = string.Empty,
                SpiderName = helper.GetSpiderBot(),
                //获取当前会话用户ID
                UserID = GetUserId(HttpContext.Current),
                UserAgent = HttpContext.Current.Request.UserAgent,
                UrlReferrer = string.Empty,
                ReferrerAuthority = string.Empty,
                //LocalPath = context.Request.Url.AbsoluteUri,//绝对uri，参考：http://www.cnblogs.com/kissdodog/archive/2013/04/22/3034898.html
                LocalPath = requestUrl,//原始uri
                IsFile = false
            };
            if (urlReferrer != null)
            {
                record.UrlReferrer = urlReferrer;
                record.ReferrerAuthority = string.Empty;
            }
            AddRecord(record);
        }


        /// <summary>
        /// 统计方法
        /// </summary>
        /// <param name="key">要统计的参数</param>
        /// <param name="requestUrl">统计的请求url</param>
        /// <param name="urlReferrer">统计的来源</param>
        public static void Add(string key, string requestUrl, string urlReferrer)
        {
            Add(HttpContext.Current, key, new Uri(requestUrl), new Uri(urlReferrer));
        }

        /// <summary>
        /// 统计方法
        /// </summary>
        /// <param name="key">要统计的参数</param>
        /// <param name="requestUrl">统计的请求url</param>
        /// <param name="urlReferrer">统计的来源</param>
        public static void Add(string key, string requestUrl, Uri urlReferrer)
        {
            Add(HttpContext.Current, key, new Uri(requestUrl), urlReferrer);
        }

        /// <summary>
        /// 统计方法，并没有来源
        /// </summary>
        /// <param name="key">要统计的参数</param>
        /// <param name="requestUrl">统计的请求url</param>
        public static void Add(string key, string requestUrl)
        {
            Add(HttpContext.Current, key, new Uri(requestUrl), null);
        }

        #endregion
    }
}