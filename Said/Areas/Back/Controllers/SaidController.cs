using Said.Application;
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
            return View();
        }

        #region Pages

        public ActionResult SaidCenter()
        {

            return View();
        }


        [HttpGet]
        public ActionResult AddSaid()
        {
            ViewBag.Title = "添加一篇Said";
            //初始化歌曲数据
            ViewData["ClassifysList"] = ClassifyApplication.Find();
            ViewData["SongsList"] = SongApplication.Find();
            ViewData["TagList"] = TagApplication.Find();
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
                SImg = form["SImg"],
                STag = form["STag"],
                SReprint = bool.Parse(form["SReprint"]),
                SName = form["SName"],
                SJS = form["SJS"],
                SCSS = form["SCSS"],
                SIsTop = bool.Parse(form["SIsTop"]),
                SDate = DateTime.Now
            };


            //应该有个tag表，保存tag，（只是）方便统计

            if (string.IsNullOrWhiteSpace(form["Classify.ClassifyId"]))//分类
                return Json(new { code = 1, msg = "分类信息错误" });
            //model.Classify = new Classify { ClassifyId = form["Classify.ClassifyId"].Trim() };
            model.ClassifyId = form["Classify.ClassifyId"].Trim();
            if (!string.IsNullOrWhiteSpace(form["Song.SSongId"]))//有歌曲ID则构建歌曲id
                //model.Song = new Song { SongId = form["Song.SSongId"].Trim() };
                model.SongId = form["Song.SSongId"].Trim();
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
            //验证，需要validateSubmit方法矫正歌曲等数据，如果没有id则生成一个id
            string vdResult = ArticleApplication.ValidateAndCorrectSubmit(model);
            if (vdResult == null)
            {
                //model.ClassifyId = model.Classify.ClassifyId;
                //model.Classify = null;
                //model.SongId = model.Song.SongId;
                //model.Song = null;

                ArticleApplication.Add(model);
                return Json(new { code = 0, msg = model.SaidId });
            }
            else
                return Json(new { code = 1, msg = vdResult });
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
            var res = ArticleApplication.Find(page, "世界");
            return Json(new
            {
                //hasNextPage = res.HasNextPage,
                //hasPreviousPage = res.HasPreviousPage,
                total = res.Count,
                rows = res.ToList<Article>()
            }, JsonRequestBehavior.AllowGet);
        }
        #endregion

    }
}
