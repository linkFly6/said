using Said.Application;
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
    public class SaidController : BaseController
    {
        //
        // GET: /Wap/Said/

        public ActionResult Index()
        {
            return View();
        }


        #region Pages
        /// <summary>
        /// Said文章页
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public ActionResult Article(string id)
        {
            ViewData["NavigatorIndex"] = 2;
            var model = ArticleApplication.Find(id);
            if (model == null)
                return View("Error");
            model.SPV++;
            //要确定之类是否要加锁
            ArticleApplication.Update(model);
            ViewData["userLike"] = UserLikeApplication.ExistsLike(model.SaidId, GetUserId(), 0) == null ? false : true;
            return View(model);
        }
        #endregion
    }
}
