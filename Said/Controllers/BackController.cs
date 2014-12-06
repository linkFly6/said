using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Back
{
    public class BackController : Controller
    {
        //
        // GET: /Back/

        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public ActionResult AddSaid()
        {
            ViewBag.Title = "添加一篇Said";
            return View();
        }

        [HttpPost]
        public int AddSaid(FormCollection form)
        {
            
            var test = form;
            return -1;
        }
    }
}
