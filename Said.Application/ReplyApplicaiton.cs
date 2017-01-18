using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class ReplyApplicaiton : BaseApplication<Reply, IReplyService>
    {
        public ReplyApplicaiton() : base(new ReplyService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 根据ID查找
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Reply Find(string id)
        {
            return Context.Get(m => m.ReplyId == id && m.IsDel == 0);
        }


        /// <summary>
        /// 根据文章返回所有子评论
        /// </summary>
        /// <param name="blogId">要检索的文章ID</param>
        /// <returns>返回SaidID列表</returns>
        public IEnumerable<Reply> FindByBlogId(string blogId)
        {
            return Context.GetMany(m => m.BlogId == blogId && m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 根据主评论返回针对该评论的所有子评论
        /// </summary>
        /// <param name="commentId">要检索的主评论ID</param>
        /// <returns>返回SaidID列表</returns>
        public IEnumerable<Reply> FindByCommentId(string commentId)
        {
            return Context.GetMany(m => m.CommentId == commentId && m.IsDel == 0, m => m.Date);
        }

    }
}
