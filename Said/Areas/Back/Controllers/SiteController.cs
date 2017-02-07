using log4net;
using PagedList;
using Said.Application;
using Said.Common;
using Said.Helper;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class SiteController : BaseController
    {

        private static readonly ILog logManager = LogManager.GetLogger(typeof(SaidController));

        //
        // GET: /Back/Site/

        #region 视图

        public ActionResult Index()
        {
            return View();
        }


        public ActionResult PageConfig()
        {
            ViewData["models"] = bannerApplication.FindAllDesc(m => m.Date);
            return View();
        }

        /// <summary>
        /// 访问概况
        /// </summary>
        /// <returns></returns>
        public ActionResult SiteRecord()
        {

            return View();
        }


        public ActionResult SiteLog()
        {
            // 得到所有的Error日志和Info 日志，然后前端自己去计算交集
            DirectoryInfo errorLogFolder = new DirectoryInfo(Server.MapPath("~/System/Log/Error"));
            DirectoryInfo infoLogFolder = new DirectoryInfo(Server.MapPath("~/System/Log/Info"));
            ViewData["errorLogFiles"] = errorLogFolder.GetFiles();
            ViewData["infoLogFiles"] = infoLogFolder.GetFiles();
            return View();
        }


        // 匹配 20170120.txt
        private Regex RegLogFile = new Regex(@"^\d{8}\.txt$");

        /// <summary>
        /// 下载日志文件
        /// </summary>
        /// <param name="type"></param>
        /// <param name="file"></param>
        /// <returns></returns>
        public ActionResult DownLoad(string type = "", string file = "")
        {
            if (!RegLogFile.IsMatch(file.Trim()))
            {
                return RedirectToAction("NotFound", "Home", new { sgs = "fileInfoError", url = Request.Url.AbsoluteUri, Area = "" });
            }
            string rootPath = "~/System/Log";
            string directory = string.Empty;
            switch (type)
            {
                case "0":// info
                    directory = "Info";
                    break;
                case "1":// error
                    directory = "Error";
                    break;
                default:
                    return RedirectToAction("NotFound", "Home", new { sgs = "logFileNotFound", url = Request.Url.AbsoluteUri, Area = "" });
            }
            string filePath = Server.MapPath(string.Format("{0}/{1}/{2}", rootPath, directory, file));
            if (!FileCommon.Exists(filePath))
            {
                return RedirectToAction("NotFound", "Home", new { sgs = "logFileNotFound2", url = Request.Url.AbsoluteUri, Area = "" });
            }
            // 拼接出 Said-Error-20170121.txt 这样的格式
            return File(filePath, "text/plain", string.Format("Said-{0}Log-{1}", directory, file));
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
            if (model == null)
            {
                return ResponseResult(1, "参数不正确");
            }
            model = model.DecodeModel() as Banner;
            string errorMsg = bannerApplication.ValidateAndCorrectSubmit(model, imageApplication);
            if (!string.IsNullOrEmpty(errorMsg))
                return ResponseResult(1, errorMsg);
            model.HTML = UrlCommon.Decode(model.HTML);
            model.BannerId = SaidCommon.GUID;
            model.Date = DateTime.Now;
            bannerApplication.Add(model);
            imageApplication.AddReferenceCount(model.ImageId);
            if (bannerApplication.Commit())
            {
                return ResponseResult(model);
            }
            else
            {
                return ResponseResult(6, "添加到数据库异常");
            }

        }


        /// <summary>
        /// 删除一条Banner
        /// </summary>
        /// <param name="id">要删除的bannerId</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult RemoveBanner(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return ResponseResult(1, "要删除的数据标志不正确");
            var model = bannerApplication.FindById(id);
            if (model == null) ResponseResult(3, "没有找到要删除的数据");
            bannerApplication.Delete(model);
            if (bannerApplication.Commit())
            {
                logManager.InfoFormat(
                    @"管理员删除了一条Banner：
                      BannerId = {0},
                      创建日期 = {1},
                      描述 = {2},
                      HTML = {3},
                      链接 = {4},
                      源码 = {5},
                      主题 = {6}
                    ", model.BannerId, model.Date, model.Description, model.HTML, model.Link, model.SourceCode, model.Theme);

                return ResponseResult();
            }
            else
                return ResponseResult(2, "服务器删除异常");
        }


        /// <summary>
        /// 获取站点访问用户记录
        /// </summary>
        /// <param name="limit">当前请求的数据起点</param>
        /// <param name="offset">页面请求数据个数</param>
        /// <param name="startDate">可略：要查询记录的开始时间</param>
        /// <param name="endDate">可略：要查询记录的结束时间</param>
        /// <param name="filterType">不可略，查询类型：0 ： 默认查询，过滤所有的冗余数据 1： 不过滤阿里云云盾的数据</param>
        /// <returns></returns>
        public JsonResult GetRecord(int limit, int offset, int filterType /*, string search = null, string sort = null, string order = null*/)
        {

            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            IPagedList<UserRecord> res = null;
            //处理更多的参数，因为Action不允许重载：DateTime startDate, DateTime endDate
            if (string.IsNullOrWhiteSpace(Request["startDate"]) || string.IsNullOrWhiteSpace(Request["endDate"]))
            {
                res = userRecordApplication.FindByPageDesc(filterType, page);
            }
            else
            {
                try
                {
                    //浏览器传过来的时间戳和本地的时间戳可能存在不对应的情况，正确的做法应该是把时间统一到UTC时间
                    DateTime startDate = ConvertHelper.GetTimeByString(Request["startDate"].Trim());
                    DateTime endDate = ConvertHelper.GetTimeByString(Request["endDate"].Trim());
                    endDate = new DateTime(endDate.Year, endDate.Month, endDate.Day, 23, 59, 59, 999);
                    res = userRecordApplication.FindByTimeSpan(filterType, page, startDate, endDate);
                }
                catch (Exception e)
                {
                    logManager.InfoFormat("不正确的请求Url{1}【请求Url】{0}", Request.RawUrl, Environment.NewLine, e);
                    return Json(new
                    {
                        total = 0,
                        msg = "请求的参数带有日期筛选，但是日期并不正确"
                    });
                }
            }

            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.TotalItemCount,
                rows = res.ToList<UserRecord>()
            }, JsonRequestBehavior.AllowGet);
        }

    }
    #endregion
}
