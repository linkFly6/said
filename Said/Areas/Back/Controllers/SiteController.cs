using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class SiteController : BaseController
    {
        //
        // GET: /Back/Site/

        public ActionResult Index()
        {
            return View();
        }


        public ActionResult PageConfig()
        {
            return View();
        }
    }
}
