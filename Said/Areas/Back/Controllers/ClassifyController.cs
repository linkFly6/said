using Said.Application;
using Said.Common;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class ClassifyController : BaseController
    {
        //
        // GET: /Back/Classify/

        public ActionResult Index()
        {
            return View();
        }

        #region Services
        /// <summary>
        /// 添加分类
        /// </summary>
        /// <param name="name">分类名</param>
        /// <param name="imgName">分类Icon</param>
        /// <returns></returns>
        public JsonResult AddClassify(string name, string imgName)
        {
            if (string.IsNullOrWhiteSpace(imgName) || !FileCommon.Exists(imgName))
                return ResponseResult(2, "上传的Icon不正确");
            if (!string.IsNullOrWhiteSpace(name))
                return ResponseResult(1, "分类名称不正确");
            Classify model = new Classify
            {
                CCount = 0,
                CIcon = imgName,
                CLastBlogId = string.Empty,
                CLastBlogName = string.Empty,
                ClassifyId = Guid.NewGuid().ToString(),
                CName = name,
                Date = DateTime.Now,
                IsDel = 0
            };
            return ClassifyApplication.Add(model) > 0 ?
                ResponseResult(model.ClassifyId) :
                ResponseResult(3, "服务器异常");
        }

        public JsonResult EditClassify()
        {
            return null;
        }

        public JsonResult DeleteClassify()
        {
            return null;
        }

        //下面为Tag逻辑

        public JsonResult AddTag()
        {
            return null;
        }
        public JsonResult EditTag()
        {
            return null;
        }
        public JsonResult DeleteTag()
        {
            return null;
        }
        #endregion

    }
}
