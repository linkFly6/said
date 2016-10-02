using Said.Controllers.Filters;
using System.Web;
using System.Web.Mvc;

namespace Said
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            //filters.Add(new CopyrightFilterAttribute());
            //filters.Add(new UserFilterAttribute());//这里的注册是全局过滤器，会作用在整个站点下
        }
    }
}