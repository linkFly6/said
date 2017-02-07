using log4net;
using log4net.Config;
using Said.Common;
using Said.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.WebPages;

namespace Said
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : HttpApplication
    {

        /// <summary>
        /// 正常日志
        /// </summary>
        private static readonly ILog logManager = LogManager.GetLogger(typeof(MvcApplication));

        private Regex regMobile = new Regex("Android|iPhone|Windows Phone|Mobile", RegexOptions.IgnoreCase);

        protected void Application_Start()
        {
            logManager.Info("应用程序启动");
            MvcHandler.DisableMvcResponseHeader = false;

            //强制检测移动端
            DisplayModeProvider.Instance.Modes.Insert(0, new DefaultDisplayMode("Mobile")
            {
                ContextCondition = (context => regMobile.IsMatch(HttpContext.Current.Request != null ? HttpContext.Current.Request.UserAgent ?? "" : ""))
            });

            //regMobile.IsMatch(HttpContext.Current.Request.UserAgent);

            BundleTable.EnableOptimizations = true;//如果要配置压缩，把这里设置成true（或者把web.config里面的debug设置为false）

#if DEBUG
            BundleTable.EnableOptimizations = false;
#endif


            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //加载配置文件
            ConfigTable.LoadConfig(Server.MapPath("~/config.json"));

            /*默认加载IP查询库*/
            Helper.IP.Load(Server.MapPath(ConfigTable.Table[ConfigEnum.SourceDataIP]));


            //启动的时候创建所有路径
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceBlogPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceBlogThumbnailPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceIconsPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceMusicImagePath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceSaidPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceSaidThumbnailPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceSystemPath));
            FileCommon.ExistsCreate(Server.MapPath(ConfigInfo.SourceSystemThumbnailPath));
        }

        //protected void Application_Error(object sender, EventArgs e)
        //{
        //    // 异常对象HttpContext.Current.Error
        //    logManager.Error("程序发生未捕获异常\n请求url：" + HttpContext.Current.Request.Url.AbsoluteUri, HttpContext.Current.Error);
        //}
    }

}