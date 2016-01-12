using Said.Controllers;
using Said.Controllers.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Wap.Controllers
{
    [UserFilterAttribute]
    public class HomeController : BaseController
    {
        //
        // GET: /Wap/Home/

        public ActionResult Index()
        {
            return View();
        }
    }
}
