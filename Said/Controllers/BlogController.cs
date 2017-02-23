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
using System.Web.Security.AntiXss;

namespace Said.Controllers
{
    [UserFilterAttribute]
    public class BlogController : BaseController
    {

        private static readonly ILog logManager = LogManager.GetLogger(typeof(BlogController));

        /// <summary>
        /// 一页数据个数
        /// </summary>
        private static readonly int PageLimit = 10;

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
            //wap访问
            if (Request.Browser.IsMobileDevice)
            {
                IPagedList<Blog> list = blogApplication.FindPartialDatasByPage(new Page { PageNumber = 1, PageSize = PageLimit });
                ViewData["total"] = list.TotalItemCount;
                ViewData["blogs"] = list.ToList();
                ViewData["maxPage"] = list.TotalItemCount % PageLimit == 0 ? list.TotalItemCount / PageLimit : list.TotalItemCount / PageLimit + 1;
                ViewData["limit"] = PageLimit;
                return View();
            }
            else
            {
                ViewData["NavigatorIndex"] = 1;
                var classifyList = classifyApplication.FindAllDesc();
                IEnumerable<Blog> blogs = null;
                if (string.IsNullOrWhiteSpace(cate))
                {

                    blogs = blogApplication.FindPartialDatas().ToList();
                }
                else
                {//带分类查询
                    var classify = classifyApplication.FindById(cate);
                    //TODO 所有带参数查询的地方，应该对参数格式做校验，比如md5的，就用正则识别一下格式是否正确
                    if (classify != null)
                    {
                        blogs = blogApplication.FindPartialDatasByClassify(classify).ToList();
                    }
                    ViewData["currClassify"] = classify;
                }
                ViewBag.SourceURL = Url.Content(CLASSIFYICONPATH);
                ViewData["blogs"] = blogs;
                ViewData["classifyList"] = classifyList;
            }
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
            // 先读 cache
            Blog model = blogApplication.FindByIdIncludes(id);
            if (model == null)
                return RedirectToAction("NotFound", "Home", new { sgs = "BlogNotFound", url = Request.Url.AbsoluteUri });
            model.BPV++;

            string cacheKey = string.Format("{0}_bpv", model.BlogId);

            int pvCount = CacheHelper.GetCache(cacheKey) == null ? 0 : (int)CacheHelper.GetCache(cacheKey);
            pvCount++;

            model.BPV += pvCount;


            // 为了性能，延迟到5次后再执行
            if (pvCount >= 5)
            {
                try
                {
                    lock (@obj)
                    {
                        blogApplication.Update(model);
                        blogApplication.Commit();
                        pvCount = 0;
                    }
                }
                catch (Exception e)
                {

                    logManager.Error(string.Format("延迟更新 Blog 失败{0}", Environment.NewLine), e);
                }
            }
            CacheHelper.SetCache(cacheKey, pvCount);
            ViewData["userLike"] = userLikeApplication.ExistsLike(model.BlogId, this.UserId, 1) == null ? false : true;
            ViewData["comments"] = commentApplication.FindByBlogId(model.BlogId).ToList();
            ViewBag.UserId = this.UserId;
            ViewBag.AdminId = this.AdminId;
            return Request.Browser.IsMobileDevice ? View("Article.Mobile", model) : View(model);
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
            string validateContextResultString = commentApplication.CheckContext(context);
            if (validateContextResultString != null) return ResponseResult(1, validateContextResultString);

            //事务需要对源进行监听，这里从数据库中获取了Blog，需要让事务监听到
            try
            {
                return SaidCommon.Transaction(() =>
                {
                    //从数据库检索Blog是否存在
                    var blog = blogApplication.FindById(blogId.Trim());
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
                    string validateUserResultString = userApplication.CheckAndTrimInput(inputUser, out user);
                    if (validateUserResultString != null) return ResponseResult(8, validateUserResultString);
                    blog.BComment++;
                    blogApplication.Update(blog);
                    //这里拿到的user是已经修剪处理好的user了
                    userApplication.Update(user);
                    Comment comment = new Comment
                    {
                        BlogId = blog.BlogId,
                        CommentId = SaidCommon.GUID,
                        Date = DateTime.Now,
                        SourceContext = context,
                        Context = context,
                        UserId = user.UserID
                    };
                    commentApplication.Add(comment);
                    if (!commentApplication.Commit())
                    {
                        throw new Exception("用户评论：评论失败");
                    }
                    // 发送邮件
                    EmailCommon.SendReplyEmailAsync("linkfly@vip.qq.com", string.Format("Said - 用户评论了文章《{0}》", blog.BTitle), context, "linkFly", string.Format("{2}://{0}/blog/{1}.html?sgs=email-more#comment", Request.Url.Authority, blog.BlogId, Request.Url.Scheme), blog.BTitle, string.Format("{2}://{0}/blog/{1}.html?sgs=email-more#comment", Request.Url.Authority, blog.BlogId, Request.Url.Scheme));
                    return ResponseResult(new { king = this.AdminId != null, id = comment.CommentId });
                });
            }
            catch (Exception e)
            {
                logManager.Error(e);
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
            string validateContextResultString = commentApplication.CheckContext(context);
            if (validateContextResultString != null) return ResponseResult(1, validateContextResultString);

            //事务需要对源进行监听，这里从数据库中获取了Blog，需要让事务监听到
            try
            {
                return SaidCommon.Transaction(() =>
                {
                    //从数据库检索Blog是否存在
                    var blog = blogApplication.FindById(blogId.Trim());
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
                    string toUserEmail = string.Empty;
                    string toUserNickName = string.Empty;

                    if (!string.IsNullOrWhiteSpace(replyId))//如果有针对回复的ID，则以回复ID为准
                    {
                        toReply = replyApplicaiton.Find(replyId);
                        if (toReply == null) throw new Exception("用户回复：回复的信息不正确");
                        if (toReply.UserId == this.UserId) throw new Exception("用户不允许回复自己的评论");
                        toUserEmail = toReply.User.EMail;
                        toUserNickName = toReply.User.Name;
                    }
                    else {//否则以评论ID为准
                        comment = commentApplication.Find(commentId);
                        if (comment == null) throw new Exception("用户回复：回复的评论不正确");
                        if (comment.UserId == this.UserId) throw new Exception("用户不允许回复自己的评论");
                        toUserEmail = comment.User.EMail;
                        toUserNickName = comment.User.Name;
                    }
                    User user = null;
                    string validateUserResultString = userApplication.CheckAndTrimInput(inputUser, out user);
                    if (validateUserResultString != null) return ResponseResult(8, validateUserResultString);
                    blog.BComment++;
                    blogApplication.Update(blog);
                    //这里拿到的user是已经修剪处理好的user了
                    userApplication.Update(user);

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
                    replyApplicaiton.Add(reply);
                    if (!replyApplicaiton.Commit())
                    {
                        throw new Exception("用户回复：添加回复对象失败");
                    }
                    // 发送邮件
                    EmailCommon.SendReplyEmailAsync(toUserEmail, string.Format("Said - 您在文章《{0}》的评论中收到新的回复", blog.BTitle), context, toUserNickName, string.Format("{2}://{0}/blog/{1}.html?sgs=email-more#comment", Request.Url.Authority, blog.BlogId, Request.Url.Scheme), blog.BTitle, string.Format("{2}://{0}/blog/{1}.html?sgs=email-more#comment", Request.Url.Authority, blog.BlogId, Request.Url.Scheme));
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
                logManager.Error("用户评论失败", e);
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
                try
                {
                    return SaidCommon.Transaction(() =>
                            {
                                var comment = commentApplication.FindNoCache(commentId);
                                if (comment != null)
                                {
                                    //标记删除
                                    comment.IsDel = 1;
                                    //if (comment.Blog.BComment > 0)
                                    //    comment.Blog.BComment--;

                                    commentApplication.Update(comment);
                                    if (commentApplication.Commit())
                                    {

                                        /*
                                            这个bug仍然没搞定：

                                            Attaching an entity of type 'Said.Models.Blog' failed because another entity of the same type already has the same primary key value. This can happen when using the 'Attach' method or setting the state of an entity to 'Unchanged' or 'Modified' if any entities in the graph have conflicting key values. This may be because some entities are new and have not yet received database-generated key values. In this case use the 'Add' method or the 'Added' entity state to track the graph and then set the state of non-new entities to 'Unchanged' or 'Modified' as appropriate.

                                            参见这里：
                                            http://stackoverflow.com/questions/23201907/asp-net-mvc-attaching-an-entity-of-type-modelname-failed-because-another-ent

                                            EF对每个查询有缓存，这里的改动是EF缓存实体里的改动，改动的blog包含在两个实体中（blog和comment.blog），导致了EF上下文不一致，才出现了这个问题
                                            这个问题尚未解决
                                        */

                                        var blog = blogApplication.FindById(comment.BlogId);
                                        if (blog.BComment > 0)
                                            blog.BComment--;
                                        blogApplication.Update(blog);
                                        if (blogApplication.Commit())
                                        {
                                            return ResponseResult();
                                        }
                                        else
                                            throw new Exception("删除评论失败，修改Blog对象异常");
                                    }
                                    else {
                                        logManager.Error(new { msg = "删除评论失败", blogId = comment.BlogId, commentId = comment.CommentId });
                                        throw new Exception("删除评论失败");
                                    }
                                }
                                return ResponseResult(2);
                            });
                }
                catch (Exception e)
                {
                    logManager.Error(e);
                    return ResponseResult(1);
                }
            }
            else {
                return ResponseResult(1);
            }
        }



        /// <summary>
        /// 分页获取blog列表
        /// </summary>
        /// <param name="limit">个数</param>
        /// <param name="offset">数据开始位置</param>
        /// <param name="search"></param>
        /// <param name="sort"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        [HttpGet]
        public JsonResult GetBlogList(int limit = 10, int offset = 0)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            //防止有人恶意频繁读取更多数据
            if (limit > PageLimit)
            {
                limit = PageLimit;
            }
            var res = blogApplication.FindPartialDatasByPage(page);
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.Select(m => new
                {
                    id = m.BlogId,
                    title = m.BTitle,
                    summary = m.BSummaryTrim,
                    cname = m.Classify.CName,
                    pv = m.BPV,
                    date = m.Date
                })
            }, JsonRequestBehavior.AllowGet);
        }



        /// <summary>
        /// 用户Like一篇Blog
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult LikeArticle(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return ResponseResult(1, "文章信息不正确");
            }
            Blog blog = blogApplication.FindById(id);

            if (blog == null)
            {
                return ResponseResult(2, "文章信息不正确");
            }
            //更新文章的结果
            bool updateArticleResult = false;
            //防止多线程修改
            lock (@obj)
            {
                blog.Likes++;
                blogApplication.Update(blog);
                updateArticleResult = blogApplication.Commit();
            }
            if (!updateArticleResult)
            {
                return ResponseResult(4, "修改文章信息失败");
            }
            userLikeApplication.Add(new UserLike
            {
                Date = DateTime.Now,
                UserId = this.UserId,
                LikeType = 1,
                UserLikeId = SaidCommon.GUID,
                LikeArticleId = id
            });
            return userLikeApplication.Commit() ? ResponseResult() : ResponseResult(3, "添加Like信息异常");
        }

        #endregion
    }
}
