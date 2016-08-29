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
    public class BlogController : BaseController
    {

        /// <summary>
        /// 分类的Icon路径
        /// </summary>
        private readonly string CLASSIFYICONPATH = "~/Source/Sys/Images/Icons/";

        object @obj = new object();
        //
        // GET: /Blog/

        #region Views
        public ActionResult Index(string cate = "")
        {
            ViewData["NavigatorIndex"] = 1;
            var classifyList = ClassifyApplication.Find();
            IEnumerable<Blog> blogs = null;
            if (string.IsNullOrWhiteSpace(cate))
            {

                blogs = BlogApplication.Find();
            }
            else
            {//带分类查询
                var classify = ClassifyApplication.Find(cate);
                //TODO 所有带参数查询的地方，应该对参数格式做校验，比如md5的，就用正则识别一下格式是否正确
                if (classify != null)
                {
                    blogs = BlogApplication.FindByClassify(classify);
                }
                ViewData["currClassify"] = classify;
            }
            ViewBag.SourceURL = Url.Content(CLASSIFYICONPATH);
            ViewData["blogs"] = blogs;
            ViewData["classifyList"] = classifyList;
            return View();
        }

        /// <summary>
        /// Blog文章页
        /// </summary>
        /// <param name="id">BlogId</param>
        /// <returns></returns>
        public ActionResult Article(string id)
        {
            ViewData["NavigatorIndex"] = 1;
            if (string.IsNullOrWhiteSpace(id))
            {
                return RedirectToAction("Index", "Blog", new { controller = "Home", sgs = "blog", refer = Request.Url.AbsoluteUri });
            }
            var model = BlogApplication.Find(id);
            if (model == null)
                return RedirectToAction("NotFound", "Home", new { sgs = "BlogNotFound", url = Request.Url.AbsoluteUri });
            model.BPV++;
            BlogApplication.Update(model);
            ViewData["userLike"] = UserLikeApplication.ExistsLike(model.BlogId, GetUserId(), 1) == null ? false : true;
            ViewData["comments"] = CommentApplication.FindByBlogId(model.BlogId);
            ViewBag.AdminId = Session["adminId"] as string;
            return View(model);
        }

        #endregion

        #region Service
        #endregion
    }
}
