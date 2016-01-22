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
        /// 贪婪获取指定个数的文章列表
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        IEnumerable<Article> GetByTop(int top);


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
