using System.Web.Mvc;

namespace Said.Areas.Wap
{
    public class WapAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Wap";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Wap_default",
                "Wap/{controller}/{action}/{id}",
                new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
