using PagedList;
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

        /// <summary>
        /// 获取所有文章的文件名
        /// </summary>
        /// <returns></returns>
        IEnumerable<Blog> GetAllBlogFileName();


        /// <summary>
        /// 获取所有文章列表（仅获取关键属性）
        /// </summary>
        /// <returns></returns>
        IPagedList<Blog> FindToList(Page page, string keywords);


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
                                            || a.BContext.Contains(keywords),
                                a => a.BDate);
        }


        /// <summary>
        /// 根据关键字分页查询得到文章对象
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">关键字</param>
        /// <returns></returns>
        IEnumerable<Blog> IBlogService.GetAllBlogFileName()
        {
            var query = (from m in base.Context.Blog
                         select new { BName = m.BName });

            return query.ToList().Select(m => new Blog
            {
                BName = m.BName
            });
            /*
             * 不能这么写：
             * 在 LINQ to Entities 查询中无法构造实体或复杂类型“Said.Domain.Said.Data.Blog”
                return (from m in base.Context.Blog
                    select new Blog{ BName = m.BName });
             * 解决方案：http://bbs.csdn.net/topics/380105442#post-382245532
             * TODO 要抽离成共用的，并且要找到简化方案
             * 
             */
        }




        /// <summary>
        /// 查询Blog的一部分数据，仅包含关键数据：BTitle,BSummary,BTag,CName,BDate,BPV,BComment
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns></returns>
        public IPagedList<Blog> FindToList(Page page, string keywords)
        {
            /**
            //如果getPage没有封装，则需要自己进行查询并分页
            //dudu在这篇文章解释了EF设计查询部分字段必须要两次select：http://www.cnblogs.com/dudu/archive/2011/03/31/entity_framework_select_new.html
            var query = (from m in base.Context.Blog
                         where m.BTitle.Contains(keywords) || m.BContext.Contains(keywords)
                         orderby m.BDate descending
                         select new
                         {
                             BTitle = m.BTitle,
                             BSummary = m.BSummary,
                             BTag = m.BTag,
                             CName = m.Classify.CName,
                             BDate = m.BDate,
                             BPV = m.BPV,
                             BComment = m.BComment
                         });
            var results = query.GetPage(page).ToList().Select(m => new Blog
            {
                BTitle = m.BTitle,
                BSummary = m.BSummary,
                BTag = m.BTag,
                Classify = new Classify { CName = m.CName },
                BDate = m.BDate,
                BPV = m.BPV,
                BComment = m.BComment
            });
            var total = Context.Blog.Count(m => m.BTitle.Contains(keywords) || m.BContext.Contains(keywords));
            return new StaticPagedList<Blog>(results, page.PageNumber, page.PageSize, total);

            **/

            return base.GetPage(page,
                                    m => m.BTitle.Contains(keywords) || m.BContext.Contains(keywords),
                                    m => m.BDate,
                                    m => new
                                    {
                                        BlogId = m.BlogId,
                                        BTitle = m.BTitle,
                                        BSummary = m.BSummary,
                                        Tag = m.Tag,
                                        CName = m.Classify.CName,
                                        BDate = m.BDate,
                                        BPV = m.BPV,
                                        BComment = m.BComment
                                    }, m => new Blog
                                    {
                                        BlogId = m.BlogId,
                                        BTitle = m.BTitle,
                                        BSummary = m.BSummary,
                                        Tag = m.Tag,
                                        Classify = new Classify { CName = m.CName },
                                        BDate = m.BDate,
                                        BPV = m.BPV,
                                        BComment = m.BComment
                                    });


        }
    }
}
