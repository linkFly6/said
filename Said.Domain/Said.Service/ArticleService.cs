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
        /// 贪婪分页查询
        /// </summary>
        /// <returns></returns>
        IPagedList<Article> FindByDateDesc(Page page, Expression<Func<Article, bool>> where, Expression<Func<Article, DateTime>> order);


        /// <summary>
        /// 贪婪获取指定个数的文章列表
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        IEnumerable<Article> GetByTop(int top);

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
            return base.GetPage(page,
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
        /// 贪婪分页查询
        /// </summary>
        /// <returns></returns>
        public IPagedList<Article> FindByDateDesc(Page page, Expression<Func<Article, bool>> where, Expression<Func<Article, DateTime>> order)
        {
            var results = Context.Article.Include("Image").Include("Song.Image").OrderByDescending(order).Where(where).GetPage(page).ToList();
            int total = Context.Article.Count(where);
            return new StaticPagedList<Article>(results, page.PageNumber, page.PageSize, total);
        }


        /// <summary>
        /// 贪婪获取指定个数的文章列表
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public IEnumerable<Article> GetByTop(int top)
        {
            return Context.Article.Include("Image").OrderByDescending(m => m.Date).Take(top);
        }
    }
}
