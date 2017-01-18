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
    public class CommentApplication : BaseApplication<Comment, ICommentServicee>
    {

        public CommentApplication() : base(new CommentService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 根据ID查询
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Comment Find(string id)
        {
            return Context.Get(m => m.CommentId == id && m.IsDel == 0);
        }

        /// <summary>
        /// 根据ID查询
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Comment FindNoCache(string id)
        {
            return Context.FindNocahe(m => m.CommentId == id && m.IsDel == 0);
        }

        /// <summary>
        /// 根据文章返回评论列表（返回的内容按照时间正序排序）
        /// </summary>
        /// <param name="blogId">要检索的文件名称</param>
        /// <returns>返回SaidID列表</returns>
        public IEnumerable<Comment> FindByBlogId(string blogId)
        {
            return Context.FindAllInfo(m => m.BlogId == blogId && m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 验证用户输入的回复
        /// </summary>
        /// <param name="comment"></param>
        /// <returns></returns>
        public string CheckContext(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Trim().Length > 140)
            {
                return "评论内容不正确，要求不超过140个字符";
            }
            return null;
        }
    }
}
