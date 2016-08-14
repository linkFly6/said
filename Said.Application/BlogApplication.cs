using PagedList;
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
    /// <summary>
    /// 使用静态类为让它变得更加晦涩，如果需要静态类的语法则可以使用单例模式实现
    /// </summary>
    public static class BlogApplication
    {

        private static IBlogService service;
        public static IBlogService Context
        {
            get { return service ?? (service = new BlogService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一篇文章
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Blog model)
        {
            Context.Add(model);
            return service.Submit();
        }


        #region 逻辑
        /// <summary>
        /// 验证一篇blog是否是有效的blog，同时矫正blog的数据
        /// </summary>
        /// <param name="model">要验证的model</param>
        /// <returns>返回null表示验证成功，否则返回验证失败的字符串，用,号分割</returns>
        public static string ValidateAndCorrectSubmit(Blog model)
        {
            StringBuilder str = new StringBuilder();
            //防止tag有HTML标签，修正
            foreach (var validateResult in model.Validate())
            {
                //validateResult.MemberNames//这个要搞懂怎么用，或许能让提示信息更全一点
                str.Append(validateResult.ErrorMessage + ",");
            }
            if (ClassifyApplication.Context.GetById(model.ClassifyId) == null)
                str.Append("分类信息不正确,");
            if (str.Length > 0)
                str.Length--;//StringBuilder的length可以用于裁剪字符串？
            else
            {
                //开始矫正数据
                //没有文件名或文件名不合法，则生成一个新的文件名
                if (string.IsNullOrWhiteSpace(model.BName) || BlogApplication.FindByFileName(model.BName.Trim()) != null)
                    model.BName = FileCommon.CreateFileNameByTime();
            }
            return str.Length > 0 ? str.ToString() : null;
        }

        /// <summary>
        /// 添加Blog，会自动修正Blog的数据，新增blogId
        /// </summary>
        /// <param name="blog"></param>
        /// <param name="tags"></param>
        /// <returns></returns>
        public static Blog AddBlog(Blog blog, IList<Tag> tags)
        {
            //先调用ValidateAndCorrectSubmit验证更合理
            blog.BlogId = string.IsNullOrWhiteSpace(blog.BName) ? FileCommon.CreateFileNameByTime() : blog.BName;
            blog.Date = DateTime.Now;
            //进行事务添加
            SaidCommon.Transaction(() =>
            {
                IList<BlogTags> blogTags = UpdateBlogTags(blog, tags);
                Add(blog);
                BlogTagsApplication.AddLists(blogTags);
            });
            return blog;
        }


        /// <summary>
        /// 将Blog的Tag添加到数据库，并生成BlogTags（Blog和Tag关系表）的数组（尚未提交到数据库，需要自己提交，并且关系表中的对象(Blog/Tag)都为null）
        /// </summary>
        /// <param name="blog"></param>
        /// <param name="tags">Blog对应的标签对象</param>
        /// <returns></returns>
        private static IList<BlogTags> UpdateBlogTags(Blog blog, IList<Tag> tags)
        {
            var selectTagIds = tags.Where(tag => !string.IsNullOrWhiteSpace(tag.TagId)).Select(m => m.TagName);//得到要查询的Tag name列表（把为null的tag的tagId过滤掉，因为前端传递过来的tag，如果是新增的，则为null），然后进行数据库查询
            IEnumerable<Tag> existTags = TagApplication.FindListByTagIdList(selectTagIds.ToArray());//从数据库中查询到已存在的Tag
            var addTags = tags.Where(tag =>
            {
                //前端传递过来，新增的tag的tagId都是null，同时去数据库中检测，如果发现有新增的项数据库中并没有
                if (string.IsNullOrWhiteSpace(tag.TagId) || !existTags.Any(t => t.TagName == tag.TagName))
                {
                    tag.TagId = SaidCommon.GUID;
                    tag.Count = 1;//tag应该由中间表记录和Blog的关系，而不应该直接查询Tag
                    tag.Date = DateTime.Now;
                    return true;
                }
                return false;
            });

            tags = existTags.Concat(addTags) as IList<Tag>;//Concat参考：http://www.cnblogs.com/heyuquan/p/Linq-to-Objects.html
            //这里应该是调用BlogTagsApplication的方法，添加并生成Tag
            if (TagApplication.AddList(addTags) < 1)
            {
                throw new Exception("新增Tag失败");
            }
            else {
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
        #endregion


        #region 查询
        /// <summary>
        /// 查找
        /// </summary>
        /// <returns></returns>
        public static Blog Find(string id)
        {
            return Context.GetById(id);
        }
        /// <summary>
        /// 查找Said的文件名
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static Blog FindByFileName(string fileName)
        {
            return Context.Get(m => m.BName == fileName);
        }

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public static IPagedList<Blog> Find(Models.Data.Page page)
        {
            //TODO要把GetPage方法好好封装一下
            return Context.GetPage(page, m => m.BTitle != null, m => m.Date);
        }

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public static IPagedList<Blog> Find(Models.Data.Page page, string keywords)
        {
            return Context.GetPage(page, m => m.BTitle.Contains(keywords) || m.BContext.Contains(keywords), m => m.Date);
        }


        /// <summary>
        /// 分页查询列表，怎么和上面方法一样啊，WTF！！
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public static IPagedList<Blog> FindToList(Models.Data.Page page, string keywords)
        {
            return Context.FindToList(page, keywords);
        }


        /// <summary>
        /// 查找全部Blog的文件名（仅可访问属性：BName）
        /// </summary>
        /// <returns>返回的数据仅仅可以访问属性：BName</returns>
        public static IEnumerable<Blog> GetAllBlogFileName()
        {
            return Context.GetAllBlogFileName();
        }

        #endregion
    }
}
