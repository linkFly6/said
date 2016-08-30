using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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
        /// 根据ID查询
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Comment Find(string id)
        {
            return Context.Get(m => m.CommentId == id && m.IsDel == 0);
        }


        /// <summary>
        /// 修改一条评论
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(Comment model)
        {
            Context.Update(model);
            return service.Submit();
        }

        /// <summary>
        /// 根据文章返回评论列表（返回的内容按照时间正序排序）
        /// </summary>
        /// <param name="blogId">要检索的文件名称</param>
        /// <returns>返回SaidID列表</returns>
        public static IEnumerable<Comment> FindByBlogId(string blogId)
        {
            return Context.FindAllInfo(m => m.BlogId == blogId && m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 验证用户输入的回复
        /// </summary>
        /// <param name="comment"></param>
        /// <returns></returns>
        public static string CheckContext(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Trim().Length > 140)
            {
                return "评论内容不正确，要求不超过140个字符";
            }
            return null;
        }
    }
}
