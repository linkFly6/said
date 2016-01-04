using System.Web.Mvc;

namespace Said.Areas.Back
{
    public class BackAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Back";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Back_default",
                "Back/{controller}/{action}/{id}",
                new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
