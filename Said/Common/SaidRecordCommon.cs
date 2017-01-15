using log4net;
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
        private static readonly ILog logManager = LogManager.GetLogger(typeof(SaidRecordCommon));

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
        /// <param name="noCache">是否跳过缓存</param>
        /// <returns></returns>
        public static string GetUserId(HttpContext context, bool noCache = false)
        {
            HttpCookie cookie = context.Request.Cookies.Get("uid");
            string userId = string.Empty;
            string cookieValue = string.Empty;

            // 没有用户ID，并且验证cookie合法 => 用户id是否存在，否则直接创建一个
            if (cookie != null && cookie.Value != null && cookie.Value.Trim().Length <= 40/*said 中 md5 生成的 uuid 只有32位*/)
            {
                cookieValue = cookie.Value.Trim();

                // 第二层检测，如果从 cache 里面没有检测到 uid
                if (CacheHelper.GetCache(cookieValue) != null)
                {
                    userId = cookieValue;
                }
                // 从数据库查询检测，并将数据库结果缓存
                if (userId == string.Empty && (noCache ?
                            UserApplication.ExistsNoCache(cookie.Value) :// 配置了跳过缓存
                            UserApplication.Exists(cookie.Value)))// EF默认有缓存，检索用户是否存在*应该*更快 
                {
                    // 确认是合法的 cookie
                    userId = cookieValue;
                    // 放入缓存
                    CacheHelper.SetCache(cookieValue, userId);
                }
            }

            // 还没有找到 uid，则重新生成一个
            if (string.Empty == userId)
            {
                cookie = new HttpCookie("uid");
                userId = SaidCommon.GUID;
                User user = new User
                {
                    UserID = userId,
                    EMail = string.Empty,
                    Name = string.Empty,
                    Date = DateTime.Now,
                    //如果是管理员则种下管理员的GUID，否则重新生成一个普通用户的GUID
                    SecretKey = context.Session["adminId"] != null ? context.Session["adminId"] as string : SaidCommon.GUID,
                    //管理员则标记上管理员身份
                    Rule = context.Session["adminId"] != null ? 1 : 0,
                    IsSubscribeComments = true,
                    Site = string.Empty
                };
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
            context.Session["userId"] = userId;
            return userId;
        }



        #region 添加统计信息
        /// <summary>
        /// 添加统计记录方法，会自动识别IP并转换成相应的区域
        /// </summary>
        /// <param name="key">统计的标记（关键词）</param>
        /// <param name="record">统计信息对象</param>
        public static void AddRecord(UserRecord record, HttpContext context)
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
                    try
                    {
                        if (UserRecordApplication.Add(record) <= 0)
                        {
                            throw new Exception("插入用户记录异常");
                        }
                    }
                    catch (Exception e)
                    {
                        /*
                            发生异常的话，这里可能是用户的cookie是伪造的，数据库中并没有真实的用户信息，所以重新生成一个
                            在之前的逻辑中使用了GetUserID()去检测用户是否存在，但是因为EF有缓存策略，可能导致检测到的用户是有缓存的，所以这里再重新获取一下用户ID，并且标记跳过缓存

                            -- 后更新：
                            这里拿到Session是为null的，因为是异步任务，而重新获取用户ID是主要注入Session的，这样会导致业务出问题，所以还是放弃这里
                            详情参见Said buglog: https://github.com/linkFly6/Said/issues/7
                        */
                        logManager.Error(string.Format("用户ID：{0}", record.UserID), e.InnerException);//这时候抛出Log
                    }
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
            AddRecord(record, context);
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
            AddRecord(record, context);
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
            AddRecord(record, HttpContext.Current);
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