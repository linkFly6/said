using Said.Application;
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
            return View();
        }

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
                SDate = DateTime.Now,
                Classify = new Classify { ClassifyId = form["Classify.ClassifyId"] }
            };
            if (!string.IsNullOrEmpty(form["Song.SSongId"]))
            {
                model.Song = new Song { SongId = form["Song.SSongId"] };
            }
            else if (!string.IsNullOrEmpty(form["Song.SongImg"]))
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
            string vdResult = ArticleApplication.ValidateSubmit(model);
            if (string.IsNullOrEmpty(vdResult))
            {
                ArticleApplication.Add(model);
                return Json(new { code = 0, msg = "ok" });
            }
            else
                return Json(new { code = 1, msg = vdResult });
        }
    }
}
