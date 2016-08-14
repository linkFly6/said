using Said.Application;
using Said.Common;
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
        #region Pages
        //
        // GET: /Back/Blog/

        public ActionResult Index()
        {
            ViewBag.Title = "Blog管理 - Said后台管理系统";
            return View();
        }

        [HttpGet]
        public ActionResult AddBlog()
        {
            ViewBag.Title = "添加Blog - Said后台管理系统 ";
            //初始化页面需要的数据
            ViewData["ClassifysList"] = ClassifyApplication.Find();
            ViewData["Tags"] = TagApplication.Find();
            ViewData["TagList"] = TagApplication.Find();
            //TOD 这个方法跟踪进去，有TODO
            var test = BlogApplication.GetAllBlogFileName().ToList<Blog>();
            //TODO 添加成功了之后要检查文件名是否读出来了
            foreach (Blog item in test)
            {
                Console.Write(item.BName);
            }
            ViewData["BlogFiles"] = test;

            return View();
        }

        [HttpGet]
        public ActionResult Edit(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return View("Error");
            ViewBag.Title = "编辑文章 - Said后台管理系统 ";
            //初始化页面需要的数据
            ViewData["ClassifysList"] = ClassifyApplication.Find();
            ViewData["Tags"] = TagApplication.Find();
            ViewData["TagList"] = TagApplication.Find();
            ViewData["BlogFiles"] = BlogApplication.GetAllBlogFileName().ToList<Blog>();
            return View(BlogApplication.Find(id));
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
            model = UrlCommon.DecodeModel<Blog>(model);
            IList<Tag> tags = null;
            if (!String.IsNullOrWhiteSpace(Request["Tags"]))
            {
                //反序列化tag
                tags = JavaScriptCommon.DeSerialize<IList<Tag>>(UrlCommon.Decode(Request["Tags"]));
            }

            string validateResult = BlogApplication.ValidateAndCorrectSubmit(model);
            if (validateResult == null)
            {
                //BlogApplication.AddBlog(model, tags);
                return ResponseResult(new { id = model.BlogId });
            }
            else
            {
                return ResponseResult(1, new { msg = validateResult });
            }

        }


        [HttpPost]
        public JsonResult Edit(Blog model)
        {
            return ResponseResult();
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
            var res = BlogApplication.FindToList(page, "这是一篇测试文章");
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Blog>()
            }, JsonRequestBehavior.AllowGet);
        }
        #endregion


    }
}
