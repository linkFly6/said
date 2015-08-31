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
    public class SiteController : BaseController
    {
        //
        // GET: /Back/Site/

        #region 视图

        public ActionResult Index()
        {
            return View();
        }


        public ActionResult PageConfig()
        {
            ViewData["models"] = BannerApplication.GetAll();

            return View();
        }

        #endregion


        #region 逻辑处理
        /// <summary>
        /// 新增一条Banner
        /// </summary>
        /// <param name="model">新增的Banner</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult AddBanner(Banner model)
        {
            string errorMsg = BannerApplication.ValidateAndCorrectSubmit(model);
            if (!string.IsNullOrEmpty(errorMsg))
                return ResponseResult(1, errorMsg);
            model.HTML = UrlCommon.Decode(model.HTML);
            model.BannerId = SaidCommon.GUID;
            model.Date = DateTime.Now;
            return BannerApplication.Add(model) > 0 ?
                ResponseResult(model) : ResponseResult(6, "添加到数据库异常");
        }


        /// <summary>
        /// 删除一条Banner
        /// </summary>
        /// <param name="id">要删除的bannerId</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult AddBanner(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return ResponseResult(1, "要删除的数据标志不正确");
            if (BannerApplication.Delete(id) > 0)
            {
                return ResponseResult();
            }
            else
                return ResponseResult(2, "服务器删除异常");
        }
        #endregion
    }
}
