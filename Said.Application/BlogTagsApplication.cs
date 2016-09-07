using Said.Common;
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
        /// 查找一个Blog对应的BlogTags关系
        /// </summary>
        /// <param name="blogId">要查找的BlogId</param>
        /// <returns></returns>
        public static IEnumerable<BlogTags> FindByBlogIdNoCache(string blogId)
        {
            return Context.FindListNoCacheInclude(m => m.BlogId == blogId, "Tag");
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


        /// <summary>
        /// 将Blog的Tag添加到数据库，并生成BlogTags（Blog和Tag关系表）的数组（尚未提交到数据库，需要自己提交，并且关系表中的对象(Blog/Tag)都为null）
        /// </summary>
        /// <param name="blog"></param>
        /// <param name="tags">Blog对应的标签对象</param>
        /// <returns></returns>
        public static IList<BlogTags> UpdateBlogTags(Blog blog, IList<Tag> tags)
        {
            var selectTagIds = tags.Where(tag => !string.IsNullOrWhiteSpace(tag.TagId)).Select(m => m.TagId);//得到要查询的Tag name列表（把为null的tag的tagId过滤掉，因为前端传递过来的tag，如果是新增的，则为null），然后进行数据库查询
            IEnumerable<Tag> existTags = TagApplication.FindListByTagIdList(selectTagIds.ToArray());//从数据库中查询到已存在的Tag
            IList<Tag> addTags = tags.Where(tag =>
            {
                //前端传递过来，新增的tag的tagId都是null，同时去数据库中检测，如果发现有新增的项数据库中并没有
                if (string.IsNullOrWhiteSpace(tag.TagId) && !existTags.Any(t => t.TagName == tag.TagName))
                {
                    tag.TagId = SaidCommon.GUID;
                    tag.Count = 1;//tag应该由中间表记录和Blog的关系，而不应该直接查询Tag
                    tag.Date = DateTime.Now;
                    return true;
                }
                return false;
            }).ToList();
            if (addTags.Count() > 0)
            {
                if (TagApplication.AddList(addTags) < 1)
                {
                    throw new Exception("新增Tag失败");
                }
            }
            if (existTags != null && existTags.Count() > 0 && addTags.Count() > 0)
                tags = existTags.Concat(addTags).ToList();//Concat参考：http://www.cnblogs.com/heyuquan/p/Linq-to-Objects.html
            else if (addTags.Count() > 0)
                tags = addTags;
            else if (existTags.Count() > 0)
                tags = existTags.ToList();

            //这里应该是调用BlogTagsApplication的方法
            //新增Tag成功，生成BlogTags
            var blogTags = new List<BlogTags>();
            foreach (var item in tags)
            {
                blogTags.Add(new BlogTags
                {
                    BlogId = blog.BlogId,
                    TagId = item.TagId,
                    Date = DateTime.Now,
                    BlogTagsId = SaidCommon.GUID
                });
            }
            return blogTags;
        }



    }
}
