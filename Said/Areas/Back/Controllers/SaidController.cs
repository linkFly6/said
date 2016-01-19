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
    public class SaidController : BaseController
    {
        //
        // GET: /Said/

        public ActionResult Index()
        {
            //TODO 注意检测贪婪查询
            ViewData["articles"] = ArticleApplication.Find().ToList();
            return View();
        }

        #region Pages

        [HttpGet]
        public ActionResult AddSaid()
        {
            ViewBag.Title = "添加一篇Said";
            //初始化歌曲数据
            ViewData["ClassifysList"] = ClassifyApplication.Find();
            ViewData["SongsList"] = SongApplication.FindAllByDesc().ToList<Song>();
            ViewData["FileNames"] = ArticleApplication.FindAllFileNames().ToList<string>();


            //ViewData["TagList"] = TagApplication.Find();
            /*
             * TODO 为什么User那个项目可以直接查出来？
            var article = ArticleApplication.Find("d68026a1-bdb8-44e3-a1df-48e8df5c4c47");
            var test = article.Classify;
            var test2 = article.Song;
             * */
            return View();
        }

        [HttpGet]
        public ActionResult Edit(string id)
        {
            return View(ArticleApplication.Find(id));
        }
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
                //SImg = form["ImageId"],
                //STag = form["STag"],
                SReprint = bool.Parse(form["SReprint"]),
                SName = form["SName"],
                SJS = form["SScript"],
                SCSS = form["SCSS"],
                SIsTop = bool.Parse(form["SIsTop"]),
                Date = DateTime.Now
            };

            model = model.DecodeModel() as Article;
            if (!string.IsNullOrWhiteSpace(form["SongId"]))//有歌曲ID则构建歌曲id
                model.SongId = form["SongId"].Trim();
            else
                return ResponseResult(1, "歌曲信息错误");

            if (!string.IsNullOrWhiteSpace(form["ImageId"]))
                model.ImageId = form["ImageId"].Trim();
            else
                return ResponseResult(1, "缩略图信息错误");
            if (model.SName == "null" || model.SName.Trim() == "null")
                model.SName = string.Empty;

            //验证，需要validateSubmit方法矫正歌曲等数据，如果没有id则生成一个id
            string vdResult = ArticleApplication.ValidateAndCorrectSubmit(model);
            if (vdResult == null)
            {
                //model.ClassifyId = model.Classify.ClassifyId;
                //model.Classify = null;
                //model.SongId = model.Song.SongId;
                //model.Song = null;
                return ArticleApplication.Add(model) > 0 ?
                    ResponseResult(0, model.SaidId) :
                    ResponseResult(2, "添加到数据库异常");
            }
            else
                return ResponseResult(1, vdResult);
        }

        #endregion

        /// <summary>
        /// 分页获取said列表
        /// </summary>
        /// <param name="limit"></param>
        /// <param name="offset"></param>
        /// <param name="search"></param>
        /// <param name="sort"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        public JsonResult GetSaidList(int limit, int offset, string search = null, string sort = null, string order = null)
        {
            var page = new Page
            {
                PageNumber = offset / limit + 1,
                PageSize = limit
            };
            var res = ArticleApplication.Find(page, "你好");
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Article>()
            }, JsonRequestBehavior.AllowGet);
        }
        #endregion


        #region 逻辑删除一篇Said
        /// <summary>
        /// 删除一篇文章
        /// </summary>
        /// <param name="id">文章id</param>
        /// <returns></returns>
        public JsonResult Delete(string id)
        {
            Article model = ArticleApplication.Find(id);
            if (model == null)
                return ResponseResult(1, "要删除的文章不存在（数据库未检索到该文章ID）");
            return ArticleApplication.Delete(model) > 0 ?
                ResponseResult()
                : ResponseResult(2, "从数据库中删除文章失败");
        }
        #endregion
    }
}
