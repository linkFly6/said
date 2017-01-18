using log4net;
using PagedList;
using Said.Application;
using Said.Common;
using Said.Controllers.Filters;
using Said.Helper;
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
        private static readonly ILog logManager = LogManager.GetLogger(typeof(BlogController));

        object @obj = new object();


        /// <summary>
        /// 延迟执行函数
        /// </summary>
        private LazyFunc<Article, int> lazyArticle = new LazyFunc<Article, int>();

        /// <summary>
        /// 一页数据个数
        /// </summary>
        private static readonly int PageLimit = 10;
        //
        // GET: /Said/

        public ActionResult Index(string pageIndex = null)
        {
            //wap访问
            if (Request.Browser.IsMobileDevice)
            {
                IPagedList<Article> list = articleApplication.FindByDateDesc(new Page { PageNumber = 1, PageSize = PageLimit });
                ViewData["total"] = list.TotalItemCount;
                ViewData["articles"] = list.ToList();
                ViewData["maxPage"] = list.TotalItemCount % PageLimit == 0 ? list.TotalItemCount / PageLimit : list.TotalItemCount / PageLimit + 1;
                ViewData["limit"] = PageLimit;
            }
            else {
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
                IPagedList<Article> list = articleApplication.FindByDateDesc(page);
                ViewData["total"] = list.TotalItemCount;
                ViewData["articles"] = list.ToList();
                ViewData["pageIndex"] = index;
                ViewData["maxPage"] = list.TotalItemCount % PageLimit == 0 ? list.TotalItemCount / PageLimit : list.TotalItemCount / PageLimit + 1;


            }
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
            if (string.IsNullOrWhiteSpace(id))
            {
                return RedirectToAction("Index", "Said", new { controller = "Home", sgs = "article", refer = Request.Url.AbsoluteUri });
            }
            ViewData["NavigatorIndex"] = 2;
            var model = CacheHelper.GetCache(id) as Article;
            if (model == null)
                model = articleApplication.FindById(id.Trim());
            if (model == null)
                return RedirectToAction("NotFound", "Home", new { sgs = "ArticleNotFound", url = Request.Url.AbsoluteUri });
            model.SPV++;
            // TODO 这里要不要换成时间的，比如 2000 ms 后自动执行一下？这样就不用一直更新 cache 了
            CacheHelper.SetCache(model.SaidId, model);
            // 为了性能，延迟到一定次数后再执行
            lazyArticle.Lazy(model, models =>
            {
                try
                {
                    if (models.Count > 0)
                    {
                        lock (@obj)
                        {
                            articleApplication.Update(models.Last());
                            articleApplication.Commit();
                        }
                    }
                }
                catch (Exception e)
                {

                    logManager.Error("延迟更新 Blog 失败\n", e);
                }
                return 0;
            });
            ViewData["userLike"] = userLikeApplication.ExistsLike(model.SaidId, this.UserId, 0) == null ? false : true;
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
            Article article = articleApplication.FindById(id);

            if (article == null)
            {
                return ResponseResult(2, "文章信息不正确");
            }
            //更新文章的结果
            bool updateArticleResult = true;
            //防止多线程修改
            lock (@obj)
            {
                article.Likes++;
                articleApplication.Update(article);
                updateArticleResult = articleApplication.Commit();
            }
            if (!updateArticleResult)
            {
                return ResponseResult(4, "修改文章信息失败");
            }
            userLikeApplication.Add(new UserLike
            {
                Date = DateTime.Now,
                UserId = this.UserId,
                LikeType = 0,
                UserLikeId = SaidCommon.GUID,
                LikeArticleId = id
            });
            return userLikeApplication.Commit() ?
                 ResponseResult() : ResponseResult(3, "添加Like信息异常");
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
        [HttpGet]
        public JsonResult GetSaidList(int limit, int offset)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            if (limit > PageLimit)
                limit = PageLimit;
            var res = articleApplication.FindByDateDesc(page);
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.Select(m => new
                {
                    url = m.SaidId,
                    img = m.Image.IName,
                    title = m.STitle,
                    summary = m.SSummaryTrim,
                    songname = m.Song.SongName,
                    artist = m.Song.SongArtist,
                    pv = m.SPV,
                    date = m.Date
                })
            }, JsonRequestBehavior.AllowGet);
        }

        #endregion
    }
}
