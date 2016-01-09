using Said.Controllers.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    [UserFilterAttribute]
    public class ProjectsController : BaseController
    {
        //
        // GET: /Projects/

        public ActionResult Index()
        {
            ViewData["NavigatorIndex"] = 3;
            return View();
        }

    }
}
