using Said.Application;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    public class SaidController : Controller
    {
        //
        // GET: /Said/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult SaidCenter()
        {

            return View();
        }
        /// <summary>
        /// 分页获取said列表
        /// </summary>
        /// <param name="limit"></param>
        /// <param name="offset"></param>
        /// <param name="search"></param>
        /// <param name="sort"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        public JsonResult GetSaidList(int limit, int offset, string search = null, string sort = null, string order = null)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            var res = ArticleApplication.Find(page, "世界");
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Article>()
            }, JsonRequestBehavior.AllowGet);
        }

    }
}
