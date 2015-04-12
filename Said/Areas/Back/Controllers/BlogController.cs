using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class BlogController : Controller
    {
        //
        // GET: /Back/Blog/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult AddBlog()
        {
            return View();
        }

    }
}
