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
        /// 检测文件标签并插入标签
        /// </summary>
        /// <param name="BlogId"></param>
        /// <param name="tags"></param>
        /// <returns></returns>
        public static IList<BlogTags> UpdateBlogTags(string BlogId, IList<Tag> tags)
        {
            var selectTag = tags.Where(tag => tag != null);//需要查询的Tag集合
            var addTags = tags.Where(tag =>
            {
                if (tag == null)
                {
                    tag.TagId = SaidCommon.CreateId();
                    tag.Count = 1;//tag应该由中间表记录和Blog的关系，而不应该直接查询Tag
                    tag.Date = DateTime.Now;
                    return true;
                }
                return false;
            });//需要添加的Tag集合
            tags = selectTag.Concat(addTags) as IList<Tag>;//Concat参考：http://www.cnblogs.com/heyuquan/p/Linq-to-Objects.html
            //这里应该是调用BlogTagsApplication的方法，添加并生成Tag
            if (TagApplication.AddList(addTags) < 1)
            {

            }
            else {
                //Tag新增完毕

            }

            return -1;
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
            return Context.GetPage(page, m => m.BTitle != null, m => m.BDate);
        }

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public static IPagedList<Blog> Find(Models.Data.Page page, string keywords)
        {
            return Context.GetPage(page, m => m.BTitle.Contains(keywords) || m.BContext.Contains(keywords), m => m.BDate);
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
