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
    public interface IBlogTagsService : IService<BlogTags>
    {
        /// <summary>
        /// 无缓存查询，并且包含指定的外键数据
        /// </summary>
        /// <param name="includes">要包含外键的字段</param>
        /// <returns></returns>
        IEnumerable<BlogTags> FindListNoCacheInclude(Expression<Func<BlogTags, bool>> where, params string[] includes);
    }
    /// <summary>
    /// 标签服务
    /// </summary>
    public class BlogTagsService : BaseService<BlogTags>, IBlogTagsService
    {

        public BlogTagsService(SaidDbContext factory)
            : base(factory)
        {

        }

        /// <summary>
        /// 无缓存查询，并且包含指定的外键数据
        /// </summary>
        /// <param name="includes">要包含外键的字段</param>
        /// <returns></returns>
        public IEnumerable<BlogTags> FindListNoCacheInclude(Expression<Func<BlogTags, bool>> where, params string[] includes)
        {
            var temp = Context.BlogTags.AsNoTracking();
            foreach (var include in includes)
            {
                temp.Include(include);
            }
            return temp.Where(where);
        }
    }

}
