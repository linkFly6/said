using log4net;
using Said.Application;
using Said.Common;
using Said.Helper;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class BlogController : BaseController
    {
        private static readonly ILog logManager = LogManager.GetLogger(typeof(BlogController));

        #region Pages
        //
        // GET: /Back/Blog/

        public ActionResult Index()
        {
            ViewData["models"] = blogApplication.FindAllToListSection().ToList();//仅包含关键数据：BTitle,BSummary,CName,BDate,BPV,BComment
            return View();
        }

        [HttpGet]
        public ActionResult AddBlog()
        {
            ViewBag.Title = "添加Blog - Said后台管理系统 ";
            //初始化页面需要的数据
            ViewData["ClassifysList"] = classifyApplication.FindAll();
            ViewData["TagList"] = tagApplication.FindAll();
            ViewData["BlogFiles"] = blogApplication.GetAllBlogFileName().ToList();
            return View();
        }

        [HttpGet]
        public ActionResult Edit(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return View("Error");
            var model = blogApplication.FindNoCacheById(id);
            if (model == null)
            {
                return RedirectToAction("Index", new
                {
                    formUrl = Request.Url.AbsoluteUri
                });
            }
            //初始化页面需要的数据
            ViewData["ClassifysList"] = classifyApplication.FindAll();
            ViewData["TagList"] = tagApplication.FindAll().ToList();
            ViewData["BlogFiles"] = blogApplication.GetAllBlogFileName().ToList();
            ViewData["BlogTags"] = blogTagsApplication.FindByBlogIdNoCache(model.BlogId).ToList();
            return View(model);
        }


        /// <summary>
        /// 预览文章页
        /// </summary>
        /// <param name="BImg"></param>
        /// <param name="BTitle"></param>
        /// <param name="BHTML"></param>
        /// <param name="ClassifyId"></param>
        /// <param name="BTag"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult Preview(string BImg, string BTitle, string BHTML, string ClassifyId, IList<string> BTag)
        {
            ViewData["BTag"] = BTag;
            ViewData["BImg"] = BImg;
            ViewData["BTitle"] = BTitle;
            ViewData["BHTML"] = HttpUtility.UrlDecode(BHTML);
            ViewData["ClassifyId"] = ClassifyId;
            ViewData["NavigatorIndex"] = 1;
            return View();
        }
        #endregion





        #region Service
        [HttpPost]
        public JsonResult AddBlog(Blog model)
        {
            //if (string.IsNullOrWhiteSpace(model.ClassifyId))
            //    return ResponseResult(1, "没有填写分类信息");

            //修正编码数据
            model = UrlCommon.DecodeModel(model);
            IList<Tag> tags = null;
            if (!String.IsNullOrWhiteSpace(Request["Tags"]))
            {
                //反序列化tag
                tags = JavaScriptCommon.DeSerialize<IList<Tag>>(UrlCommon.Decode(Request["Tags"]));
            }
            else {
                return ResponseResult(1, new { msg = "标签不允许为空" });
            }

            string validateResult = blogApplication.ValidateAndCorrectSubmit(model, classifyApplication);
            if (validateResult == null)
            {
                return SaidCommon.Transaction(() =>
                 {
                     blogApplication.AddBlog(model, tags, blogTagsApplication, tagApplication);
                     if (blogApplication.Commit())
                     {
                         return ResponseResult(new { id = model.BlogId });
                     }
                     return ResponseResult(2);
                 });
            }
            else
            {
                return ResponseResult(1, new { msg = validateResult });
            }

        }


        [HttpPost]
        public JsonResult Edit(Blog newModel)
        {
            newModel = UrlCommon.DecodeModel(newModel);
            if (string.IsNullOrWhiteSpace(newModel.BlogId))
                return ResponseResult(-1, "要编辑的文章ID不正确（无法获取）");
            var model = blogApplication.FindById(newModel.BlogId);
            IList<Tag> tags = null;
            if (!string.IsNullOrWhiteSpace(Request["Tags"]))
            {
                //反序列化tag
                tags = JavaScriptCommon.DeSerialize<IList<Tag>>(UrlCommon.Decode(Request["Tags"]));
            }
            else {
                return ResponseResult(1, new { msg = "标签不允许为空" });
            }
            //TODO 应该先对两个blog进行修改，如果发现是一样的就不修改blog了
            string validateResult = blogApplication.ValidateAndCorrectSubmit(newModel, classifyApplication);
            if (validateResult == null)
            {
                return SaidCommon.Transaction(() =>
                {
                    blogApplication.EditBlog(newModel, model, tags, tagApplication, blogTagsApplication);
                    if (blogTagsApplication.Commit())
                    {
                        // 清理 cache，因为前台读取的时候引用了 cache
                        if (CacheHelper.GetCache(model.BlogId) != null)
                            CacheHelper.RemoveAllCache(model.BlogId);
                        return ResponseResult(new { id = newModel.BlogId });
                    }
                    return ResponseResult(2, "修改Blog失败");
                });
            }
            else
            {
                return ResponseResult(1, new { msg = validateResult });
            }
        }

        /// <summary>
        /// 分页获取Blog列表
        /// </summary>
        /// <param name="limit"></param>
        /// <param name="offset"></param>
        /// <param name="search"></param>
        /// <param name="sort"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        public JsonResult GetBlogList(int limit, int offset, string search = null, string sort = null, string order = null)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            var res = blogApplication.FindToListSectionByKeywords(page, "这是一篇测试文章");
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Blog>()
            }, JsonRequestBehavior.AllowGet);
        }



        #region 逻辑删除一篇Said
        /// <summary>
        /// 逻辑删除一篇文章
        /// </summary>
        /// <param name="id">文章id</param>
        /// <returns></returns>
        public JsonResult Delete(string id)
        {
            Blog model = blogApplication.FindById(id);
            if (model == null)
                return ResponseResult(1, "要删除的文章不存在（数据库未检索到该文章ID）");
            blogApplication.LogicDelete(model);
            return blogApplication.Commit() ?
                ResponseResult()
                : ResponseResult(2, "从数据库中删除文章失败");
        }

        /// <summary>
        /// 物理删除一篇文章
        /// </summary>
        /// <param name="id">文章id</param>
        /// <returns></returns>
        public JsonResult RealDelete(string id)
        {
            Blog model = blogApplication.FindById(id);
            if (model == null)
                return ResponseResult(1, "要删除的文章不存在（数据库未检索到该文章ID）");
            try
            {
                return SaidCommon.Transaction(() =>
                {
                    var blogTags = blogTagsApplication.FindByBlogId(model.BlogId);
                    if (blogTags != null && blogTags.Count() > 0)
                    {
                        blogTagsApplication.DeleteByBlogId(model.BlogId);
                        //if (!blogTagsApplication.Commit())
                        //{
                        //    throw new Exception("删除文章失败（删除Blog和标签对应的关系失败）");
                        //};
                    }
                    return SaidCommon.Transaction(() =>
                    {
                        blogApplication.DeleteBlog(model, blogTagsApplication);
                        if (blogApplication.Commit())
                        {
                            return ResponseResult();
                        }
                        throw new Exception("从数据库中删除文章失败");
                    });

                });
            }
            catch (Exception e)
            {
                return ResponseResult(2, e.Message);
            }

        }
        #endregion
        #endregion


    }
}
