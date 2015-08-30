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
        #endregion
    }
}
