using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class ReplyApplicaiton
    {
        private static IReplyService service;
        public static IReplyService Context
        {
            get { return service ?? (service = new ReplyService(new Domain.Said.Data.DatabaseFactory())); }
        }


        /// <summary>
        /// 新增一条针对评论的评论
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Reply model)
        {
            Context.Add(model);
            return service.Submit();
        }

        /// <summary>
        /// 修改一条针对评论的评论
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(Reply model)
        {
            Context.Add(model);
            return service.Submit();
        }

        /// <summary>
        /// 根据文章返回所有子评论
        /// </summary>
        /// <param name="blogId">要检索的文章ID</param>
        /// <returns>返回SaidID列表</returns>
        public static IEnumerable<Reply> FindByBlogId(string blogId)
        {
            return Context.GetManyDesc(m => m.BlogId == blogId && m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 根据主评论返回针对该评论的所有子评论
        /// </summary>
        /// <param name="commentId">要检索的主评论ID</param>
        /// <returns>返回SaidID列表</returns>
        public static IEnumerable<Reply> FindByCommentId(string commentId)
        {
            return Context.GetManyDesc(m => m.CommentId == commentId && m.IsDel == 0, m => m.Date);
        }

    }
}
