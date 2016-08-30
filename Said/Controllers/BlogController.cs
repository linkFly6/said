using Said.Application;
using Said.Common;
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
            ViewData["userLike"] = UserLikeApplication.ExistsLike(model.BlogId, this.UserId, 1) == null ? false : true;
            ViewData["comments"] = CommentApplication.FindByBlogId(model.BlogId).ToList(); //TODO 这里要进行贪婪加载
            ViewBag.AdminId = Session["adminId"] as string;
            return View(model);
        }

        #endregion

        #region Service
        /// <summary>
        /// 用户提交评论
        /// </summary>
        /// <param name="blogId"></param>
        /// <param name="nickName"></param>
        /// <param name="site"></param>
        /// <param name="email"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Comment(string blogId, string nickName, string site, string email, string context)
        {
            //TODO 这里要防反复提交，刷评论，DDos攻击之类的
            nickName = UrlCommon.Decode(nickName);
            site = UrlCommon.Decode(site);
            email = UrlCommon.Decode(email);
            context = UrlCommon.Decode(context);
            if (string.IsNullOrWhiteSpace(blogId)) return ResponseResult(1, "文章不正确");
            //验证输入的文本
            string validateContextResultString = CommentApplication.CheckContext(context);
            if (validateContextResultString != null) return ResponseResult(1, validateContextResultString);

            //事务需要对源进行监听，这里从数据库中获取了Blog，需要让事务监听到
            return SaidCommon.Transaction(() =>
            {
                //从数据库检索Blog是否存在
                var blog = BlogApplication.Find(blogId.Trim());
                if (blog == null) return ResponseResult(2, "文章不正确");
                //准备数据
                var inputUser = new User
                {
                    UserID = this.UserId,
                    Name = nickName,
                    Site = site,
                    EMail = email
                };
                User user = null;
                string validateUserResultString = UserApplication.CheckAndTrimInput(inputUser, out user);
                if (validateUserResultString != null) return ResponseResult(8, validateUserResultString);
                blog.BComment++;
                if (BlogApplication.Update(blog) <= 0)
                {
                    return ResponseResult(3, "日志修改失败");
                }
                //这里拿到的user是已经修剪处理好的user了
                if (UserApplication.Update(user) <= 0)
                {
                    return ResponseResult(3, "用户信息修改失败");
                }

                Comment comment = new Comment
                {
                    BlogId = blog.BlogId,
                    CommentId = SaidCommon.GUID,
                    Date = DateTime.Now,
                    SourceContext = context,
                    Context = context,
                    UserId = user.UserID
                };
                if (CommentApplication.Add(comment) <= 0)
                {
                    return ResponseResult(3, "评论失败");
                }

                return ResponseResult(new { king = this.AdminId != null, id = comment.CommentId });
            });
        }


        /// <summary>
        /// 删除用户评论
        /// </summary>
        /// <param name="commentId"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult DeleteComment(string commentId)
        {
            if (this.AdminId != null && !string.IsNullOrWhiteSpace(commentId))
            {
                return SaidCommon.Transaction(() =>
                {
                    var comment = CommentApplication.Find(commentId);
                    if (commentId != null)
                    {
                        //标记删除
                        comment.IsDel = 1;
                        if (comment.Blog.BComment > 0)
                            comment.Blog.BComment--;
                        if (CommentApplication.Update(comment) > 0)
                            return ResponseResult();
                    }
                    return ResponseResult(2);
                });

            }
            else {
                return ResponseResult(1);
            }
        }
        #endregion
    }
}
