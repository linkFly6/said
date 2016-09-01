using log4net;
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

        private static readonly ILog logManager = LogManager.GetLogger(typeof(BlogController));

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
            ViewData["comments"] = CommentApplication.FindByBlogId(model.BlogId).ToList();
            ViewBag.UserId = this.UserId;
            ViewBag.AdminId = this.AdminId;
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
            if (string.IsNullOrWhiteSpace(blogId)) return ResponseResult(1, "用户评论：文章不正确");
            //验证输入的文本
            string validateContextResultString = CommentApplication.CheckContext(context);
            if (validateContextResultString != null) return ResponseResult(1, validateContextResultString);

            //事务需要对源进行监听，这里从数据库中获取了Blog，需要让事务监听到
            try
            {
                return SaidCommon.Transaction(() =>
                {
                    //从数据库检索Blog是否存在
                    var blog = BlogApplication.Find(blogId.Trim());
                    if (blog == null) throw new Exception("用户评论：文章不正确");
                    //准备数据
                    var inputUser = new User
                    {
                        UserID = this.UserId,
                        Name = nickName,
                        Site = site,
                        EMail = email,
                        //有可能当前用户本来是普通用户，但是管理员新开了页面登录了后台，这样角色的身份就不一样了，这里需要同步把用户角色，并且把用户key同步过去
                        Rule = this.AdminId != null ? 1 : 0,
                        SecretKey = this.AdminId
                    };
                    User user = null;
                    string validateUserResultString = UserApplication.CheckAndTrimInput(inputUser, out user);
                    if (validateUserResultString != null) return ResponseResult(8, validateUserResultString);
                    blog.BComment++;
                    if (BlogApplication.Update(blog) <= 0)
                    {
                        throw new Exception("用户评论：日志修改失败");
                    }
                    //这里拿到的user是已经修剪处理好的user了
                    if (UserApplication.Update(user) <= 0)
                    {
                        throw new Exception("用户评论：用户信息修改失败");
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
                        throw new Exception("用户评论：评论失败");
                    }

                    return ResponseResult(new { king = this.AdminId != null, id = comment.CommentId });
                });
            }
            catch (Exception e)
            {
                logManager.Error(e.InnerException);
                return ResponseResult(1, "评论失败");
            }
        }


        /// <summary>
        /// 用户回复（针对评论的回复或针对回复的回复）
        /// </summary>
        /// <param name="blogId"></param>
        /// <param name="commentId">针对评论的ID</param>
        /// <param name="replyId">针对回复的ID</param>
        /// <param name="nickName">昵称</param>
        /// <param name="site">站点</param>
        /// <param name="email"></param>
        /// <param name="context">评论内容</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Reply(string blogId, string commentId, string replyId, string nickName, string site, string email, string context)
        {
            //TODO 这里要防反复提交，刷评论，DDos攻击之类的
            nickName = UrlCommon.Decode(nickName);
            site = UrlCommon.Decode(site);
            email = UrlCommon.Decode(email);
            context = UrlCommon.Decode(context);
            if (string.IsNullOrWhiteSpace(blogId)) return ResponseResult(1, "文章不正确");
            if (string.IsNullOrWhiteSpace(commentId) && string.IsNullOrWhiteSpace(replyId)) return ResponseResult(1, "要回复的评论不正确");
            //验证输入的文本
            string validateContextResultString = CommentApplication.CheckContext(context);
            if (validateContextResultString != null) return ResponseResult(1, validateContextResultString);

            //事务需要对源进行监听，这里从数据库中获取了Blog，需要让事务监听到
            try
            {
                return SaidCommon.Transaction(() =>
                {
                    //从数据库检索Blog是否存在
                    var blog = BlogApplication.Find(blogId.Trim());
                    if (blog == null) throw new Exception("用户回复：文章不正确");
                    //准备数据
                    var inputUser = new User
                    {
                        UserID = this.UserId,
                        Name = nickName,
                        Site = site,
                        EMail = email
                    };
                    Reply toReply = null;
                    Comment comment = null;

                    if (!string.IsNullOrWhiteSpace(replyId))//如果有针对回复的ID，则以回复ID为准
                    {
                        toReply = ReplyApplicaiton.Find(replyId);
                        if (toReply == null) throw new Exception("用户回复：回复的信息不正确");
                        if (toReply.UserId == this.UserId) throw new Exception("用户不允许回复自己的评论");
                    }
                    else {//否则以评论ID为准
                        comment = CommentApplication.Find(commentId);
                        if (comment == null) throw new Exception("用户回复：回复的评论不正确");
                        if (comment.UserId == this.UserId) throw new Exception("用户不允许回复自己的评论");
                    }
                    User user = null;
                    string validateUserResultString = UserApplication.CheckAndTrimInput(inputUser, out user);
                    if (validateUserResultString != null) return ResponseResult(8, validateUserResultString);
                    blog.BComment++;
                    if (BlogApplication.Update(blog) <= 0)
                    {
                        throw new Exception("用户回复：日志修改失败");
                    }
                    //这里拿到的user是已经修剪处理好的user了
                    if (UserApplication.Update(user) <= 0)
                    {
                        throw new Exception("用户回复：用户信息修改失败");
                    }

                    Reply reply = new Reply
                    {
                        BlogId = blog.BlogId,
                        ReplyId = SaidCommon.GUID,
                        CommentId = toReply == null ? comment.CommentId : toReply.CommentId,
                        Context = context,
                        SourceContext = context,
                        Date = DateTime.Now,
                        UserId = user.UserID,
                        ReplyType = toReply == null ? 0 : 1,
                        ToReplyId = toReply == null ? null : toReply.ReplyId
                    };
                    if (ReplyApplicaiton.Add(reply) <= 0)
                    {
                        throw new Exception("用户回复：添加回复对象失败");

                    }
                    return ResponseResult(new
                    {
                        king = this.AdminId != null,
                        cid = reply == null ? comment.CommentId : reply.CommentId,
                        rid = reply == null ? string.Empty : reply.ReplyId
                    });
                });
            }
            catch (Exception e)
            {
                logManager.Error(e.InnerException);
                return ResponseResult(3, "评论失败");
            }

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
