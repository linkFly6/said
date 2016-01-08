using Said.Controllers.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    [UserFilterAttribute]
    public class OtherController : BaseController
    {
        //
        // GET: /Other/

        public ActionResult About()
        {
            ViewData["NavigatorIndex"] = 5;
            return View();
        }

    }
}
