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
        IPagedList<Blog> FindToListSectionByKeywords(Page page, string keywords);


        /// <summary>
        /// 获取所有文章列表（仅获取关键属性）
        /// </summary>
        /// <returns></returns>
        IEnumerable<Blog> FindAllToListSectionByKeywords(string keywords);


        /// <summary>
        /// 无条件获取所有文章列表（仅获取关键属性）
        /// </summary>
        /// <returns></returns>
        IEnumerable<Blog> FindAllToListSection();

        /// <summary>
        /// 根据Blog文件名称，获取该文件名称对应的Blog（列表）
        /// </summary>
        /// <param name="filename">要检索的文件名称</param>
        /// <returns></returns>
        IEnumerable<string> GetBlogIdByFileName(string fileName);

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
                                a => a.Date);
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
        /// 查询Blog的一部分数据，仅包含关键数据：BTitle,BSummary,CName,BDate,BPV,BComment
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns></returns>
        public IPagedList<Blog> FindToListSectionByKeywords(Page page, string keywords)
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
                                    m => m.Date,
                                    m => new
                                    {
                                        BlogId = m.BlogId,
                                        BTitle = m.BTitle,
                                        BSummary = m.BSummary,
                                        //Tags = m.Tags,
                                        CName = m.Classify.CName,
                                        Date = m.Date,
                                        BPV = m.BPV,
                                        BComment = m.BComment
                                    }, m => new Blog
                                    {
                                        BlogId = m.BlogId,
                                        BTitle = m.BTitle,
                                        BSummary = m.BSummary,
                                        //Tags = m.Tags,
                                        Classify = new Classify { CName = m.CName },
                                        Date = m.Date,
                                        BPV = m.BPV,
                                        BComment = m.BComment
                                    });


        }


        /// <summary>
        /// 查询Blog的一部分数据，仅包含关键数据：BTitle,BSummary,CName,BDate,BPV,BComment
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns></returns>
        public IEnumerable<Blog> FindAllToListSectionByKeywords(string keywords)
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

            //这里会报错，请参考FindAllToListSection
            var query = from m in Context.Blog
                        join c in Context.Classify on m.ClassifyId equals c.ClassifyId
                        where m.BlogId.Contains(keywords) || m.BContext.Contains(keywords)
                        orderby m.Date descending
                        select new Blog
                        {
                            BlogId = m.BlogId,
                            BTitle = m.BTitle,
                            BSummary = m.BSummary,
                            Classify = new Classify { CName = c.CLastBlogName },
                            Date = m.Date,
                            BPV = m.BPV,
                            BComment = m.BComment
                        };
            return query.ToList();

        }

        /// <summary>
        /// 无条件获取所有文章列表（仅获取关键属性）
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Blog> FindAllToListSection()
        {
            //return from m in Context.Set<Blog>()
            //       join c in Context.Classify on m.ClassifyId equals c.ClassifyId
            //       orderby m.Date descending
            //select m;  
            //select new Blog
            //{
            //    BlogId = c.ClassifyId,
            //    //BlogId = m.BlogId,
            //    //BTitle = m.BTitle,
            //    //BSummary = m.BSummary,
            //    //Classify = new Classify { CName = c.CName },
            //    //Date = m.Date,
            //    //BPV = m.BPV
            //    //,BComment = m.BComment
            //};
            /*  这里可以select m，
                但是不能直接new Blog，
                这是EF的要求，要求返回的对象可以是一个匿名对象/其他对象，但不能是DBContext中的对象
                http://stackoverflow.com/questions/5325797/the-entity-cannot-be-constructed-in-a-linq-to-entities-query
                可以使用下面的查询方案来进行查询，
                先匿名，再转换成对象
                链接STO里说这种方式生成的Sql会先进行全量查询，把所有数据查出来之后再把需要的属性筛选出来
                但经过Sql Server Profiler抓取发现是进行关键属性查询的，所以性能的要求也达到了
            */
            return (from m in Context.Blog
                    join c in Context.Classify on m.ClassifyId equals c.ClassifyId
                    orderby m.Date descending
                    select new
                    {
                        BlogId = m.BlogId,
                        BTitle = m.BTitle,
                        BSummary = m.BSummary,
                        Classify = new { CName = c.CName },
                        Date = m.Date,
                        BPV = m.BPV,
                        BComment = m.BComment,
                        Likes = m.Likes
                    }).ToList().Select(m => new Blog
                    {
                        BlogId = m.BlogId,
                        BTitle = m.BTitle,
                        BSummary = m.BSummary,
                        Classify = new Classify { CName = m.Classify.CName },
                        Date = m.Date,
                        BPV = m.BPV,
                        BComment = m.BComment,
                        Likes = m.Likes
                    });//如果再在后面追加Select，则会进数据库把所有的结果查出来然后进行筛选，这样性能要求就达不到了，所以这里只能勉强返回IQueryable

        }
        /// <summary>
        /// 根据Blog文件名称，获取该文件名称对应的Blog（列表）
        /// </summary>
        /// <param name="filename">要检索的文件名称</param>
        /// <returns></returns>
        public IEnumerable<string> GetBlogIdByFileName(string fileName)
        {
            return from m in Context.Blog
                   where m.BName == fileName
                   select m.BlogId;
        }
    }
}
