using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Said
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.MapRoute(
                name: "saidDetail",
                url: "said/{id}.html",//参见http://blog.csdn.net/leftfist/article/details/9969797
               defaults: new { controller = "Said", action = "Article", id = UrlParameter.Optional },
               namespaces: new string[] { "Said.Controllers" }
            );
            routes.MapRoute(
                name: "saidNotFound",
                url: "{code}",
                defaults: new { controller = "Home", action = "NotFound" },
                constraints: new { code = @"404(.html)?" }, //匹配：http://www.tasaid.com/404 和 http://www.tasaid.com/404.html
                namespaces: new string[] { "Said.Controllers" }
            );
            routes.MapRoute(
                name: "said",
                url: "said/{pageIndex}",
               defaults: new { controller = "Said", action = "Index", pageIndex = UrlParameter.Optional },
               constraints: new { pageIndex = @"[\d]+" },
               namespaces: new string[] { "Said.Controllers" }
            );
            routes.MapRoute(
                name: "Back",
                url: "Back/{controller}/{action}/{id}",
               defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional },
               namespaces: new string[] { "Said.Areas.Back.Controllers" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional },
                namespaces: new string[] { "Said.Controllers" }
            );



        }
    }
}