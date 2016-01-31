using Said.Application;
using Said.Controllers.Filters;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.WebPages;

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
            if (Request.Browser.IsMobileDevice)//wap
            {
                var res = ArticleApplication.FindByDateDesc(new Page
                {
                    PageNumber = 1,
                    PageSize = 10
                });
                ViewData["articleList"] = res.ToList<Article>();
                ViewData["maxPage"] = res.TotalItemCount % 10 == 0 ? res.TotalItemCount / 10 : res.TotalItemCount / 10 + 1;
            }
            else {
                ViewData["articleList"] = ArticleApplication.GetByTop(3).ToList<Article>();
            }
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


        #region Service


        #endregion
    }
}
