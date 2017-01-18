using Said.Application;
using Said.Controllers.Filters;
using Said.Helper;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    [AdminFilterAttribute]
    public class BaseController : Controller
    {
        //这个控制器可以定义顶层控制器的行为
        protected AdminApplication adminApplication = new AdminApplication();
        protected AdminRecordApplication adminRecordApplication = new AdminRecordApplication();
        protected ArticleApplication articleApplication = new ArticleApplication();
        protected BannerApplication bannerApplication = new BannerApplication();
        protected BlogApplication blogApplication = new BlogApplication();
        protected BlogTagsApplication blogTagsApplication = new BlogTagsApplication();
        protected ClassifyApplication classifyApplication = new ClassifyApplication();
        protected CommentApplication commentApplication = new CommentApplication();
        protected ImageApplication imageApplication = new ImageApplication();
        protected ReplyApplicaiton replyApplicaiton = new ReplyApplicaiton();
        protected SongApplication songApplication = new SongApplication();
        protected TagApplication tagApplication = new TagApplication();
        protected UserApplication userApplication = new UserApplication();
        protected UserLikeApplication userLikeApplication = new UserLikeApplication();
        protected UserRecordApplication userRecordApplication = new UserRecordApplication();
        public BaseController()
        {

        }


        /// <summary>
        /// 获取当前登录管理员的管理员信息
        /// </summary>
        /// <returns></returns>
        protected Admin GetAdmin()
        {
            HttpCookie recordCookie = Request.Cookies["sh"];
            Admin admin = CacheHelper.GetCache(recordCookie.Value) as Admin;
            if (admin == null)
            {
                //从数据库中查询
                AdminRecord record = adminRecordApplication.Get(recordCookie.Value);
                if (record == null) return null;
                admin = record.Admin;
                CacheHelper.SetCache(recordCookie.Value, admin);
            }
            return admin;
        }


        #region Other

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功
        /// </summary>
        /// <returns></returns>
        protected JsonResult ResponseResult()
        {
            return Json(new { code = 0 });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功，并发送指定的数据
        /// </summary>
        /// <param name="data">发送的数据</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(object data)
        {
            return Json(new { code = 0, data = data });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="data">(如果有的话)发送的数据</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(int code, object data = null)
        {
            return Json(new { code = code, data = data });
        }

        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(int code, string msg)
        {
            return Json(new { code = code, msg = msg });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息、错误数据
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <param name="data">错误数据</param>
        /// <returns></returns>
        protected JsonResult ResponseResult(int code, string msg, object data = null)
        {
            return Json(new { code = code, msg = msg, data = data });
        }

        #endregion
    }
}
