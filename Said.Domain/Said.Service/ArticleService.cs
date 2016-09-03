using PagedList;
using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    /// <summary>
    /// 听说（文章）服务接口
    /// </summary>
    public interface IArticleService : IService<Article>
    {
        /// <summary>
        /// 根据关键字分页查询得到文章对象
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">关键字</param>
        /// <returns></returns>
        IEnumerable<Article> GetByKeywords(Page page, string keywords);

        /// <summary>
        /// 获取所有文章的文件名称
        /// </summary>
        /// <returns></returns>
        IEnumerable<string> GetFileNames();


        /// <summary>
        /// 贪婪分页查询，为提升性能，只返回关键属性：
        /// SaidId
        /// STitle
        /// SSummaryTrim
        /// Date
        /// Image => { IName, IFileName }
        /// SPV
        /// Likes
        /// Song => { SongName, SongFileName, SongArtist, SongAlbum, Image => { IFileName,IName  } }
        /// </summary>
        /// <returns></returns>
        IPagedList<Article> FindByPartialDatasDateDesc(Page page);


        /// <summary>
        /// 有条件查询全部文章（贪婪查询）
        /// </summary>
        /// <param name="where">查询条件</param>
        /// <param name="order">排序规则</param>
        /// <returns></returns>
        IEnumerable<Article> FindByWhereDateDesc<T>(Expression<Func<Article, bool>> where, Expression<Func<Article, T>> order);


        /// <summary>
        /// 无条件查询全部文章（贪婪查询）
        /// </summary>
        /// <param name="order">排序规则</param>
        /// <returns></returns>
        IEnumerable<Article> FindAll<T>(Expression<Func<Article, T>> order);

        /// <summary>
        /// 获取指定个数的文章列表，为提升性能，仅获取这些关键属性：
        /// SaidId
        /// STitle
        /// SSummaryTrim
        /// Date
        /// Image => { IName, IFileName }
        /// SPV
        /// Likes
        /// Song => { SongName, SongFileName, SongArtist, SongAlbum, Image => { IFileName,IName  } }
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        IEnumerable<Article> GetByTopPartialDatas(int top);


        /// <summary>
        /// 根据文章文件名称，获取该文件名称对应的SaidId（列表）
        /// </summary>
        /// <param name="filename">要检索的文件名称</param>
        /// <returns></returns>
        IEnumerable<string> GetSaidIdByFileName(string fileName);

    }
    /// <summary>
    /// 听说（文章）服务
    /// </summary>
    public class ArticleService : BaseService<Article>, IArticleService
    {


        public ArticleService(DatabaseFactory factory)
            : base(factory)
        {

        }

        /// <summary>
        /// 根据关键字分页查询得到文章对象
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">关键字</param>
        /// <returns></returns>
        IEnumerable<Article> IArticleService.GetByKeywords(Page page, string keywords)
        {
            return base.GetPageDesc(page,
                                    a => a.STitle.Contains(keywords)
                                        || a.SSummary.Contains(keywords)
                                            || a.SContext.Contains(keywords)
                                                || a.STag.Contains(keywords),
                                a => a.Date);
            //return from a in base.Context.Article
            //                    join c in Context.Classify on a.ClassifyId equals c.ClassifyId
            //                    where a.STitle.Contains(keywords) || a.SSummary.Contains(keywords) || a.SContext.Contains(keywords) || a.STag.Contains(keywords)
            //                    orderby a.SDate descending
            //                    select new Article
            //                    {
            //                        STitle = a.STitle,
            //                        STag = a.STag,
            //                        SSummary = a.SSummary,
            //                        SSummaryTrim = a.SSummary,
            //                        SPV = a.SPV,
            //                        SName = a.SName,
            //                        SComment = a.SComment,
            //                        ClassifyId = c.ClassifyId
            //                    };
        }



        /// <summary>
        /// 获取所有文章的文件名称
        /// </summary>
        /// <returns></returns>
        public IEnumerable<string> GetFileNames()
        {
            return from m in base.Context.Article
                   select m.SName;
        }



        /// <summary>
        /// 根据文章文件名称，获取该文件名称对应的SaidId（列表）
        /// </summary>
        /// <param name="filename">要检索的文件名称</param>
        /// <returns></returns>
        public IEnumerable<string> GetSaidIdByFileName(string filename)
        {
            return from m in base.Context.Article
                   where m.SName == filename
                   select m.SaidId;
        }



        /// <summary>
        /// 贪婪分页查询，为提升性能，只返回关键属性：
        /// SaidId
        /// STitle
        /// SSummaryTrim
        /// Date
        /// Image => { IName, IFileName }
        /// SPV
        /// Likes
        /// Song => { SongName, SongFileName, SongArtist, SongAlbum, Image => { IFileName,IName  } }
        /// </summary>
        /// <returns></returns>
        public IPagedList<Article> FindByPartialDatasDateDesc(Page page)
        {

            return base.GetPageDesc(page,
                                   m => m.IsDel == 0,
                                   m => m.Date,
                                   m => new
                                   {
                                       id = m.SaidId,
                                       title = m.STitle,
                                       Summary = m.SSummaryTrim,
                                       song = new { name = m.Song.SongName, artist = m.Song.SongArtist, album = m.Song.SongAlbum, img = m.Song.Image.IFileName },
                                       img = m.Image.IName,
                                       date = m.Date,
                                       pv = m.SPV,
                                       likes = m.Likes,

                                   }, m => new Article
                                   {
                                       SaidId = m.id,
                                       STitle = m.title,
                                       SSummaryTrim = m.Summary,
                                       Date = m.date,
                                       Image = new Image { IName = m.img, IFileName = m.img },
                                       SPV = m.pv,
                                       Likes = m.likes,
                                       Song = new Song
                                       {
                                           SongName = m.song.name,
                                           SongFileName = m.song.name,
                                           SongArtist = m.song.artist,
                                           SongAlbum = m.song.album,
                                           Image = new Image { IFileName = m.song.img, IName = m.song.img }
                                       }
                                   });
        }


        /// <summary>
        /// 获取指定个数的文章列表，为提升性能，仅获取这些关键属性：
        /// SaidId
        /// STitle
        /// SSummaryTrim
        /// Date
        /// Image => { IName, IFileName }
        /// SPV
        /// Likes
        /// Song => { SongName, SongFileName, SongArtist, SongAlbum, Image => { IFileName,IName  } }
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public IEnumerable<Article> GetByTopPartialDatas(int top)
        {
            return (from m in Context.Article
                        //join i in Context.Image on m.ImageId equals i.ImageId
                    orderby m.Date descending
                    where m.IsDel == 0
                    select new
                    {
                        Id = m.SaidId,
                        title = m.STitle,
                        Summary = m.SSummaryTrim,
                        date = m.Date,
                        song = new { name = m.Song.SongName, artist = m.Song.SongArtist, album = m.Song.SongAlbum, img = m.Song.Image.IFileName },
                        img = m.Image.IName,
                        pv = m.SPV,
                        like = m.Likes
                    }).ToList().Select(m => new Article
                    {
                        SaidId = m.Id,
                        STitle = m.title,
                        SSummaryTrim = m.Summary,
                        Date = m.date,
                        Image = new Image { IName = m.img, IFileName = m.img },
                        SPV = m.pv,
                        Likes = m.like,
                        Song = new Song
                        {
                            SongName = m.song.name,
                            SongFileName = m.song.name,
                            SongArtist = m.song.artist,
                            SongAlbum = m.song.album,
                            Image = new Image { IFileName = m.song.img, IName = m.song.img }
                        }
                    }).Take(top);
            //return Context.Article.Include("Image").OrderByDescending(m => m.Date).Take(top);
        }

        /// <summary>
        /// 有条件查询全部文章（贪婪查询）
        /// </summary>
        /// <param name="where">查询条件</param>
        /// <param name="order">排序规则</param>
        /// <returns></returns>
        public IEnumerable<Article> FindByWhereDateDesc<T>(Expression<Func<Article, bool>> where, Expression<Func<Article, T>> order)
        {
            return Context.Article.Include("Image").Include("Song.Image").OrderByDescending(order).Where(where);
        }

        /// <summary>
        /// 无条件查询全部文章（贪婪查询）
        /// </summary>
        /// <param name="order">排序规则</param>
        /// <returns></returns>
        public IEnumerable<Article> FindAll<T>(Expression<Func<Article, T>> order)
        {
            return Context.Article.Include("Image").Include("Song.Image").OrderByDescending(order);
        }
    }
}
