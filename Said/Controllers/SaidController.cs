using PagedList;
using Said.Application;
using Said.Common;
using Said.Controllers.Filters;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    [UserFilterAttribute]
    public class SaidController : BaseController
    {
        object @obj = new object();

        /// <summary>
        /// 一页数据个数
        /// </summary>
        int PageLimit = 10;
        //
        // GET: /Said/

        public ActionResult Index(string pageIndex = null)
        {
            //wap访问跳转到wap首页
            if (Request.Browser.IsMobileDevice)
            {
                return RedirectToAction("Index", "Home");
            }
            ViewData["NavigatorIndex"] = 2;
            int index = 1;
            if (!string.IsNullOrEmpty(pageIndex))
            {
                int.TryParse(pageIndex, out index);
            }
            var page = new Page
            {
                //PageNumber = index / PageLimit + 1,
                PageNumber = index,
                PageSize = PageLimit
            };
            IPagedList<Article> list = ArticleApplication.FindByDateDesc(page);
            ViewData["total"] = list.TotalItemCount;
            ViewData["articles"] = list.ToList();
            ViewData["pageIndex"] = index;
            ViewData["maxPage"] = list.TotalItemCount % PageLimit == 0 ? list.TotalItemCount / PageLimit : list.TotalItemCount / PageLimit + 1;
            return View();
        }

        #region Pages
        /// <summary>
        /// Said文章页
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        //[WapFilterAttribute]
        public ActionResult Article(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return RedirectToAction("Index", "Said", new { controller = "Home", sgs = "article", refer = Request.Url.AbsoluteUri });
            }
            ViewData["NavigatorIndex"] = 2;
            var model = ArticleApplication.Find(id);
            if (model == null)
                return RedirectToAction("NotFound", "Home", new { sgs = "ArticleNotFound", url = Request.Url.AbsoluteUri });
            model.SPV++;
            //要确定之类是否要加锁
            ArticleApplication.Update(model);
            ViewData["userLike"] = UserLikeApplication.ExistsLike(model.SaidId, GetUserId(), 0) == null ? false : true;
            return View(model);
        }
        #endregion


        #region Service
        /// <summary>
        /// 用户Like一篇Said
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult LikeArticle(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return ResponseResult(1, "文章信息不正确");
            }
            Article article = ArticleApplication.Find(id);

            if (article == null)
            {
                return ResponseResult(2, "文章信息不正确");
            }
            //更新文章的结果
            int updateArticle = 0;
            //防止多线程修改
            lock (@obj)
            {
                article.Likes++;
                updateArticle = ArticleApplication.Update(article);
            }
            if (updateArticle < 0)
            {
                return ResponseResult(4, "修改文章信息失败");
            }
            return UserLikeApplication.Add(new UserLike
            {
                Date = DateTime.Now,
                UserId = GetUserId(),
                LikeType = 0,
                UserLikeId = SaidCommon.GUID,
                LikeArticleId = id
            }) > 0 ? ResponseResult() : ResponseResult(3, "添加Like信息异常");
        }




        /// <summary>
        /// 分页获取said列表
        /// </summary>
        /// <param name="limit">个数</param>
        /// <param name="offset">数据开始位置</param>
        /// <param name="search"></param>
        /// <param name="sort"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        public JsonResult GetSaidList(int limit, int offset)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            var res = ArticleApplication.FindByDateDesc(page);
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Article>()
            }, JsonRequestBehavior.AllowGet);
        }

        #endregion
    }
}
