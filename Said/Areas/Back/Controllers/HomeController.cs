using Said.Application;
using Said.Common;
using Said.Helper;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Areas.Back.Controllers
{
    public class HomeController : BaseController
    {
        //
        // GET: /Back/

        public ActionResult Index()
        {
            return View();
        }


        [HttpGet]
        public ActionResult Login()
        {

            return View();
        }

        [HttpPost]
        public JsonResult Login(string name, string pwd)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return ResponseResult(1, "没有输入用户名");
            }
            if (string.IsNullOrWhiteSpace(pwd))
                return ResponseResult(2, "没有输入用户密码");
            string newPwd = Encrypt.MD5Encrypt(pwd);
            //登录记录
            AdminRecord record = new AdminRecord
            {
                Date = DateTime.Now,
                //AdminId = admin.AdminId,
                //Description = string.Format("管理员【{0}】登录", admin.Name),
                IP = HttpHelper.GetIP(System.Web.HttpContext.Current),
                OperationType = OperationType.Login,
                Rollback = string.Empty,
                Url = Request.RawUrl,
                Address = string.Empty,
                UserAgent = HttpContext.Request.UserAgent,
                AdminRecordId = Guid.NewGuid().ToString().Replace("-", "")
            };
            if (HttpContext.Request.UrlReferrer != null)
            {
                record.UrlReferrer = HttpContext.Request.UrlReferrer.AbsolutePath;
                record.ReferrerAuthority = HttpContext.Request.UrlReferrer.Authority;
            }


            //判断白名单
            if (!IPRange.Check(record.IP))
            {
                //将这次记录打入数据库
                record.Description = string.Format("异常IP（白名单约束）正在登录，输入的用户名:{0}，密码:{1}", name, pwd);
                record.OperationType = OperationType.Warning;
                AdminRecordApplication.Add(record);
                return ResponseResult(6, "登录异常");
            }
            Admin admin = AdminApplication.Get(name, newPwd);
            if (admin == null)
            {
                record.Description = string.Format("请求登录失败，输入的用户名:{0}，密码:{1}", name, pwd);
                record.OperationType = OperationType.Warning;
                return ResponseResult(3, "用户名或密码不正确");
            }
            record.AdminId = admin.AdminId;
            record.Description = string.Format("管理员【{0}】登录", admin.Name);

            return AdminRecordApplication.Add(record) > 0 ?
                ResponseResult(record.AdminRecordId) ://成功返回登录记录
                ResponseResult(5, "添加登录记录异常");
        }


        #region Logic
        /// <summary>
        /// 检测歌曲文件名是否已经存在
        /// </summary>
        /// <returns></returns>
        public JsonResult ExistsSongFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ResponseResult(1, "不是合法的文件名");
            var res = SongApplication.FindByFileName(fileName.Trim());
            if (res != null)
                return ResponseResult(2, "存在重复项", new { name = res.SongName });
            return ResponseResult();
        }

        /// <summary>
        /// 检测Said文件名是否已经存在
        /// </summary>
        /// <returns></returns>
        public JsonResult ExistsSaidFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ResponseResult(1, "不是合法的文件名");
            var res = ArticleApplication.FindByFileName(fileName.Trim());
            if (res != null)
                return ResponseResult(2, "存在重复项", new { name = res.STitle });
            return ResponseResult();
        }
        #endregion



    }
}
