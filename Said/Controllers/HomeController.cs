using Said.Application;
using Said.Controllers.Filters;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    [UserFilterAttribute]
    public class HomeController : BaseController
    {
        //
        // GET: /Home/
        //[WapFilterAttribute]
        public ActionResult Index()
        {
            ViewData["articleList"] = ArticleApplication.GetByTop(3).ToList<Article>();
            return View();
        }


        /// <summary>
        /// 404
        /// </summary>
        /// <returns></returns>
        public ActionResult NotFound()
        {
            return View();
        }


        /// <summary>
        /// 404
        /// </summary>
        /// <returns></returns>
        public ActionResult About()
        {
            ViewData["NavigatorIndex"] = 5;
            return View();
        }
    }
}
