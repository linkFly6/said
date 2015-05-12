using Said.Application;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class BlogController : BaseController
    {
        //
        // GET: /Back/Blog/

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult AddBlog()
        {
            ViewBag.Title = "Said后台管理系统 - 添加Blog";
            //初始化页面需要的数据
            ViewData["ClassifysList"] = ClassifyApplication.Find();
            ViewData["TagList"] = TagApplication.Find();
            return View();
        }


        [HttpPost]
        public JsonResult AddBlog(Blog model)
        {
            if (string.IsNullOrWhiteSpace(model.ClassifyId))
                return ResponseResult(1, "分类信息错误");

            return ResponseResult();
        }

    }
}
