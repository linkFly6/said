using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class BlogController : BaseController
    {
        //
        // GET: /Back/Blog/

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult AddBlog()
        {
            return View();
        }


        [HttpPost]
        public JsonResult AddBlog(FormCollection form)
        {
            Blog model = new Blog
            {
                BTitle = form["BTitle"]
            };
            Console.Write(form);
            return ResponseResult();
        }

    }
}
