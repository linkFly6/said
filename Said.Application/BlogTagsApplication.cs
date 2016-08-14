using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class BlogTagsApplication
    {
        private static IBlogTagsService service;
        public static IBlogTagsService Context
        {
            get { return service ?? (service = new BlogTagsService(new Domain.Said.Data.DatabaseFactory())); }
        }


        public static int Add(BlogTags model)
        {
            Context.Add(model);
            return Context.Submit();
        }

        /// <summary>
        /// 新增一组BlogTags
        /// </summary>
        /// <param name="models"></param>
        /// <returns></returns>
        public static int AddLists(IList<BlogTags> models)
        {
            foreach (var item in models)
            {
                Context.Add(item);
            }
            return Context.Submit();
        }



        /// <summary>
        /// 查找一个Blog对应的BlogTags关系
        /// </summary>
        /// <param name="blogId">要查找的BlogId</param>
        /// <returns></returns>
        public static IEnumerable<BlogTags> FindByBlogId(string blogId)
        {
            return Context.GetMany(m => m.BlogId == blogId);
        }

        /// <summary>
        /// 根据TagId获取一组BlogTags
        /// </summary>
        /// <param name="tagId"></param>
        /// <returns></returns>
        public static IEnumerable<BlogTags> FindByTagId(string tagId)
        {
            return Context.GetMany(m => m.TagId == tagId);
        }

        /// <summary>
        /// 删除对应Blog的一组BlogTags ** 注意，该删除操作是真实的删除操作 **
        /// </summary>
        /// <param name="blogId">要操作删除的BlogId</param>
        /// <returns></returns>
        public static int DeleteByBlogId(string blogId)
        {
            Context.Delete(m => m.BlogId == blogId);
            return Context.Submit();
        }


        /// <summary>
        /// 删除对应Tag的一组BlogTags ** 注意，该删除操作是真实的删除操作 **
        /// </summary>
        /// <param name="tagId">要操作删除的tagId</param>
        /// <returns></returns>
        public static int DeleteByBlogTagId(string tagId)
        {
            Context.Delete(m => m.TagId == tagId);
            return Context.Submit();
        }
    }
}
