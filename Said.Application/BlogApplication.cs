using PagedList;
using Said.Common;
using Said.Models;
using Said.Models.Data;
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


        /// <summary>
        /// 根据文章文件名称，获取该文件名称对应的BlogId（列表），用于检索文件重名业务
        /// </summary>
        /// <param name="fileName">要检索的文件名称</param>
        /// <returns>返回SaidID列表</returns>
        public static IEnumerable<string> FindBlogIdByFileName(string fileName)
        {
            return Context.GetBlogIdByFileName(fileName);
        }

        /// <summary>
        /// 修改Blog
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(Blog model)
        {
            Context.Update(model);
            return service.Submit();
        }


        /// <summary>
        /// 逻辑删除一个Blog（修改isDelete），该删除操作仅为逻辑删除，仍然可以在数据库中检索到数据
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int LogicDelete(Blog model)
        {
            Context.Del(model);
            return Context.Submit();
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

                if (string.IsNullOrEmpty(model.BlogId))//新增
                {

                    //开始矫正数据
                    //没有文件名或文件名不合法，则生成一个新的文件名
                    if (string.IsNullOrWhiteSpace(model.BName) || BlogApplication.FindByFileName(model.BName.Trim()) != null)
                        model.BName = FileCommon.CreateFileNameByTime();
                }
                else {
                    //编辑
                    if (string.IsNullOrWhiteSpace(model.BName))
                    {
                        model.BName = FileCommon.CreateFileNameByTime();
                    }
                    else {
                        //从数据库中检索是否存在
                        var SaidIdLists = FindBlogIdByFileName(model.BName).ToList();
                        //文件名重复
                        if (SaidIdLists.Count > 1 && SaidIdLists.IndexOf(model.BName) > -1)
                        {
                            model.BName = FileCommon.CreateFileNameByTime();
                        }

                    }

                }


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
                IList<BlogTags> blogTags = BlogTagsApplication.UpdateBlogTags(blog, tags);
                Add(blog);
                BlogTagsApplication.AddLists(blogTags);
            });
            return blog;
        }


        /// <summary>
        /// 修改Blog，会自动修正Blog的数据
        /// </summary>
        /// <param name="newBlog">修改完成的Blog</param>
        /// /// <param name="blog">要修改的Blog</param>
        /// <param name="tags"></param>
        /// <returns></returns>
        public static int EditBlog(Blog newBlog, Blog blog, IList<Tag> tags)
        {
            //先调用ValidateAndCorrectSubmit验证更合理
            newBlog.Date = DateTime.Now;
            //进行事务添加
            return SaidCommon.Transaction(() =>
            {
                if (BlogTagsApplication.DeleteByBlogId(blog.BlogId) <= 0)
                {
                    throw new Exception("删除原Blog和标签关系异常");
                }
                IList<BlogTags> blogTags = BlogTagsApplication.UpdateBlogTags(blog, tags);
                //对齐Blog对象
                blog.BTitle = newBlog.BTitle;
                blog.BContext = newBlog.BContext;
                blog.BSummary = newBlog.BSummary;
                blog.BSummaryTrim = newBlog.BSummaryTrim;
                blog.BHTML = newBlog.BHTML;
                blog.BScript = newBlog.BScript;
                blog.BReprint = newBlog.BReprint;
                //blog.BPV = newBlog.BPV;
                //blog.Likes = newBlog.Likes;
                blog.BName = newBlog.BName;
                blog.BLastCommentUser = newBlog.BLastCommentUser;
                blog.BLastComment = newBlog.BLastComment;
                blog.BIsTop = newBlog.BIsTop;
                blog.BImgTrim = newBlog.BImgTrim;
                blog.BImg = newBlog.BImg;
                //blog.BComment = newBlog.BComment;
                //blog.BClick = newBlog.BClick;
                blog.ClassifyId = newBlog.ClassifyId;
                blog.BName = newBlog.BName;
                Update(blog);
                BlogTagsApplication.AddLists(blogTags);
                return 1;
            });
        }







        /// <summary>
        /// 删除Blog以及Blog对应的BlogTags ** 注意：该删除是真实的删除，不可恢复 **
        /// </summary>
        /// <param name="blog"></param>
        /// <returns></returns>
        public static int DeleteBlog(Blog blog)
        {
            return SaidCommon.Transaction(() =>
            {
                Context.Delete(blog);
                BlogTagsApplication.DeleteByBlogId(blog.BlogId);
                return Context.Submit();
            });
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
        /// 查找（跳过缓存）
        /// </summary>
        /// <returns></returns>
        public static Blog FindNoCache(string id)
        {
            return Context.FindNoCache(m => m.BlogId == id);
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
        /// 无条件查询全部（按时间排序）
        /// </summary>
        /// <returns>未被标记删除的结果集</returns>
        public static IEnumerable<Blog> Find()
        {
            return Context.GetManyDesc(m => m.IsDel == 0, m => m.Date);
        }


        /// <summary>
        /// 按照分类查询
        /// </summary>
        /// <param name="classify">分类对象</param>
        /// <returns>未被标记删除的结果集</returns>
        public static IEnumerable<Blog> FindByClassify(Classify classify)
        {
            return Context.GetManyDesc(m => m.IsDel == 0 && m.ClassifyId == classify.ClassifyId, m => m.Date);
        }

        /// <summary>
        /// 按照分类Id查询
        /// </summary>
        /// <param name="classifyId">分类ID</param>
        /// <returns>未被标记删除的结果集</returns>
        public static IEnumerable<Blog> FindByClassify(string classifyId)
        {
            return Context.GetManyDesc(m => m.IsDel == 0 && m.ClassifyId == classifyId, m => m.Date);
        }



        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public static IPagedList<Blog> Find(Page page)
        {
            return Context.GetPage(page, m => m.BTitle != null, m => m.Date);
        }

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public static IPagedList<Blog> Find(Page page, string keywords)
        {
            return Context.GetPage(page, m => m.BTitle.Contains(keywords) || m.BContext.Contains(keywords), m => m.Date);
        }



        /// <summary>
        /// 查询所有列表，仅包含Blog部分属性
        /// </summary>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public static IEnumerable<Blog> FindAllToListSectionByKeywords(string keywords)
        {
            return Context.FindAllToListSectionByKeywords(keywords);
        }


        /// <summary>
        /// 分页查询列表，仅包含Blog部分属性
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public static IPagedList<Blog> FindToListSectionByKeywords(Page page, string keywords)
        {
            return Context.FindToListSectionByKeywords(page, keywords);
        }

        /// <summary>
        /// 分页查询列表，仅包含关键数据：BTitle,BSummary,CName,BDate,BPV,BComment
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Blog> FindAllToListSection()
        {
            return Context.FindAllToListSection();
        }


        /// <summary>
        /// 查找全部Blog的文件名（仅可访问属性：BName）
        /// </summary>
        /// <returns>返回的数据仅仅可以访问属性：BName</returns>
        public static IEnumerable<Blog> GetAllBlogFileName()
        {
            return Context.GetAllBlogFileName();
        }

        /// <summary>
        /// 分页查询，为提升性能，仅获取这些关键属性：
        /// BlogId
        /// BTitle
        /// Classify => { CName , ClassifyId}
        /// Date
        /// BSummaryTrim
        /// BPV
        /// </summary>
        /// <returns>返回的数据仅仅可以访问属性：BName</returns>
        public static IPagedList<Blog> FindPartialDatasByPage(Page page)
        {
            return Context.GetPartialDatasByPage(page);
        }

        /// <summary>
        /// 获取指定个数的文章列表（时间倒序），为提升性能，仅获取这些关键属性：
        /// BlogId
        /// BTitle
        /// Classify => { CName , ClassifyId}
        /// Date
        /// BSummaryTrim
        /// BPV
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public static IEnumerable<Blog> FindPartialDatasByTop(int top)
        {
            return Context.GetPartialDatasByTop(top);
        }


        /// <summary>
        /// 获取所有文章列表（默认条件为时间倒序，数据标记删除），为提升性能，仅获取这些关键属性：
        /// BlogId
        /// BTitle
        /// Classify => { CName , ClassifyId}
        /// Date
        /// BSummaryTrim
        /// BPV
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public static IEnumerable<Blog> FindPartialDatas()
        {
            return Context.GetAllPartialDatas();
        }

        /// <summary>
        /// 按照分类ID获取文章，只包含部分特殊属性
        /// BlogId
        /// BTitle
        /// Classify => { CName , ClassifyId}
        /// Date
        /// BSummaryTrim
        /// BPV
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public static IEnumerable<Blog> FindPartialDatasByClassify(string classifyId)
        {
            return Context.GetAllPartialDatasByClassifyId(classifyId);
        }

        /// <summary>
        /// 按照分类ID获取文章，只包含部分特殊属性
        /// BlogId
        /// BTitle
        /// Classify => { CName , ClassifyId}
        /// Date
        /// BSummaryTrim
        /// BPV
        /// </summary>
        /// <param name="top">要获取的个数</param>
        /// <returns></returns>
        public static IEnumerable<Blog> FindPartialDatasByClassify(Classify classify)
        {
            return Context.GetAllPartialDatasByClassifyId(classify.ClassifyId);
        }

        #endregion
    }
}
