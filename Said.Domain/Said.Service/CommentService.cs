using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    /// <summary>
    /// 标签服务接口
    /// </summary>
    public interface ICommentServicee : IService<Comment>
    {
        /// <summary>
        /// 根据文章返回评论列表（返回的内容按照时间正序排序），并且贪婪加载所有信息
        /// </summary>
        /// <param name="where">查询条件</param>
        /// <param name="order">正序排列字段</param>
        /// <returns></returns>
        IEnumerable<Comment> FindAllInfo<T>(Expression<Func<Comment, bool>> where, Expression<Func<Comment, T>> order);


        /// <summary>
        /// 根据条件返回一条结果，强制跳过EF缓存，并且贪婪加载User和Blog
        /// </summary>
        /// <param name="where"></param>
        /// <returns></returns>
        Comment FindNocahe(Expression<Func<Comment, bool>> where);
    }
    /// <summary>
    /// 标签服务
    /// </summary>
    public class CommentService : BaseService<Comment>, ICommentServicee
    {

        public CommentService(SaidDbContext context)
            : base(context)
        {

        }

        /// <summary>
        /// 根据文章返回评论列表（返回的内容按照时间正序排序），并且贪婪加载所有信息
        /// </summary>
        /// <param name="where">查询条件</param>
        /// <param name="order">正序排列字段</param>
        /// <returns></returns>
        public Comment FindNocahe(Expression<Func<Comment, bool>> where)
        {
            //EF每次查询的时候会从缓存读，而评论要求时效性，所以使用AsNoTracking()把缓存给干掉
            return Context.Comment.AsNoTracking().Include("User").Include("Blog").Where(where).FirstOrDefault();
        }


        /// <summary>
        /// 根据文章返回评论列表（返回的内容按照时间正序排序），并且贪婪加载所有信息
        /// </summary>
        /// <param name="where">查询条件</param>
        /// <param name="order">正序排列字段</param>
        /// <returns></returns>
        public IEnumerable<Comment> FindAllInfo<T>(Expression<Func<Comment, bool>> where, Expression<Func<Comment, T>> order)
        {
            //EF每次查询的时候会从缓存读，而评论要求时效性，所以使用AsNoTracking()把缓存给干掉
            return Context.Comment.AsNoTracking().Include("User").Include("Replys").OrderBy(order).Where(where);
        }
    }

}
