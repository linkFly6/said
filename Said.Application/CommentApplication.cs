using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class CommentApplication
    {
        private static ICommentServicee service;
        public static ICommentServicee Context
        {
            get { return service ?? (service = new CommentService(new Domain.Said.Data.DatabaseFactory())); }
        }


        /// <summary>
        /// 新增一条评论
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Comment model)
        {
            Context.Add(model);
            return service.Submit();
        }

        /// <summary>
        /// 修改一条评论
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(Comment model)
        {
            Context.Add(model);
            return service.Submit();
        }

        /// <summary>
        /// 根据文章返回评论列表
        /// </summary>
        /// <param name="blogId">要检索的文件名称</param>
        /// <returns>返回SaidID列表</returns>
        public static IEnumerable<Comment> FindByBlogId(string blogId)
        {
            return Context.GetManyDesc(m => m.BlogId == blogId && m.IsDel == 0, m => m.Date);
        }

    }
}
