using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace Said
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            RegisterDataBase();
        }
        /// <summary>
        /// 测试代码，上线请删除
        /// </summary>
        private void RegisterDataBase()
        {
            //Database.SetInitializer(new DropCreateDatabaseIfModelChanges<BlogEntities>());
            //AreaRegistration.RegisterAllAreas();
        }
    }
}