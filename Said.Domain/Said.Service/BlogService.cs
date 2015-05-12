using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{

    /// <summary>
    /// Blog（文章）服务接口
    /// </summary>
    public interface IBlogService : IService<Blog>
    {
        /// <summary>
        /// 根据关键字分页查询得到文章对象
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">关键字</param>
        /// <returns></returns>
        IEnumerable<Blog> GetByKeywords(Page page, string keywords);


    }
    /// <summary>
    /// Blog（文章）服务
    /// </summary>
    public class BlogService : BaseService<Blog>, IBlogService
    {
        public BlogService(DatabaseFactory factory)
            : base(factory)
        {

        }

        /// <summary>
        /// 根据关键字分页查询得到文章对象
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">关键字</param>
        /// <returns></returns>
        IEnumerable<Blog> IBlogService.GetByKeywords(Page page, string keywords)
        {
            return base.GetPage(page,
                                    a => a.BTitle.Contains(keywords)
                                        || a.BSummary.Contains(keywords)
                                            || a.BContext.Contains(keywords)
                                                || a.BTag.Contains(keywords),
                                a => a.BDate);
            //(from a in base.Context.Article
            //       join c in Context.Classify on a.SClassifyId equals c.ClassifyId
            //       where a.STitle.Contains(keywords) || a.SSummary.Contains(keywords) || a.SContext.Contains(keywords) || a.STag.Contains(keywords)
            //       orderby a.SDate descending
            //       select new Article
            //       {
            //           STitle = a.STitle,
            //           STag = a.STag,
            //           SSummary = a.SSummary,
            //           SSummaryTrim = a.SSummary,
            //           SPV = a.SPV,
            //           SName = a.SName,
            //           SComment = a.SComment,
            //           SClassifyId = c.ClassifyId
            //       });
        }

    }
}
