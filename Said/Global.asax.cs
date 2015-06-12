using Said.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Script.Serialization;

namespace Said
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        public static Dictionary<string, string> ConfigTable;

        /// <summary>
        /// 读取全局配置文件
        /// </summary>
        /// <param name="path"></param>
        private static void LoadConfig(string path)
        {
            string jsonString = FileCommon.ReadToString(path);
            JavaScriptSerializer jss = new JavaScriptSerializer();
            ConfigTable = jss.Deserialize<Dictionary<string, string>>(jsonString);
            if (ConfigTable == null)
                ConfigTable = new Dictionary<string, string>();
        }
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            //加载配置文件
            if (ConfigTable == null)
                LoadConfig(Server.MapPath("~/config.json"));
            /*默认加载IP查询库*/
            Said.Helper.IP.Load(Server.MapPath(ConfigTable[ConfigEnum.SourceDataIP]));

        }
    }

}