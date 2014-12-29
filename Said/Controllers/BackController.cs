using Said.Application;
using Said.Common;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers.Back
{
    public class BackController : Controller
    {
        //
        // GET: /Back/

        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public ActionResult AddSaid()
        {
            ViewBag.Title = "添加一篇Said";
            //初始化歌曲数据
            //ViewData["Classifys"] = ClassifyApplication.Context.GetAll();
            return View();
        }
        #region Pages

        #endregion


        #region Service

        #region 添加一篇Said
        [HttpPost]
        public JsonResult AddSaid(FormCollection form)
        {
            //终于写到服务器了...
            Article model = new Article
            {
                STitle = form["STitle"],
                SContext = form["SContext"],
                SHTML = form["SHTML"],
                SSummary = form["SSummary"],
                SImg = form["SImg"],
                STag = form["STag"],
                SReprint = bool.Parse(form["SReprint"]),
                SName = form["SName"],
                SJS = form["SJS"],
                SCSS = form["SCSS"],
                SIsTop = bool.Parse(form["SIsTop"]),
                SDate = DateTime.Now
            };
            if (string.IsNullOrWhiteSpace(form["Classify.ClassifyId"]))//分类
                return Json(new { code = 1, msg = "分类信息错误" });
            model.Classify = new Classify { ClassifyId = form["Classify.ClassifyId"].Trim() };
            if (!string.IsNullOrWhiteSpace(form["Song.SSongId"]))//有歌曲ID则构建歌曲id
                model.Song = new Song { SongId = form["Song.SSongId"].Trim() };
            else if (!string.IsNullOrWhiteSpace(form["Song.SongImg"]))//否则创建新的歌曲对象
            {
                model.Song = new Song
                {
                    SongImg = form["Song.songImg"],
                    SongName = form["Song.SongName"],
                    SongAlbum = form["Song.SongAlbum"],
                    SongArtist = form["Song.SongArtist"],
                    SongFileName = form["Song.FileName"]
                };
            }
            else
                return Json(new { code = 1, msg = "歌曲信息错误" });
            //验证
            string vdResult = ArticleApplication.ValidateSubmit(model);
            if (vdResult == null)
            {
                //生成modelID
                model.SaidId = Guid.NewGuid().ToString();
                if (model.Song != null)
                    model.Song.SongId = Guid.NewGuid().ToString();
                //没有文件名或文件名不合法，则生成一个新的文件名
                if (string.IsNullOrWhiteSpace(model.SName) || ArticleApplication.FindByFileName(model.SName.Trim()) != null)
                    model.SName = FileCommon.CreateFileNameByTime();
                ArticleApplication.Add(model);
                return Json(new { code = 0, msg = model.SaidId });
            }
            else
                return Json(new { code = 1, msg = vdResult });
        }

        #endregion

        #endregion

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

        #region Other

        /// <summary>
        /// 通用返回结果到客户端方法，表示成功
        /// </summary>
        /// <returns></returns>
        private JsonResult ResponseResult()
        {
            return Json(new { code = 0 });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <returns></returns>
        private JsonResult ResponseResult(int code)
        {
            return Json(new { code = code });
        }
        /// <summary>
        /// 通用返回结果到客户端方法，指定错误代码、错误信息
        /// </summary>
        /// <param name="code">错误代码（0表示没有错误，其他数字表示错误）</param>
        /// <param name="msg">错误信息</param>
        /// <returns></returns>
        private JsonResult ResponseResult(int code, string msg)
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
        private JsonResult ResponseResult(int code, string msg, object data = null)
        {
            return Json(new { code = code, msg = msg, data = data });
        }

        #endregion
    }
}
