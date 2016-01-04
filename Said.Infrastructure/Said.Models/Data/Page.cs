using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models.Data
{
    /// <summary>
    /// 分页对象
    /// </summary>
    public class Page
    {
        /// <summary>
        /// 页码，默认1
        /// </summary>
        public int PageNumber { get; set; }
        /// <summary>
        /// 一页个数，默认10
        /// </summary>
        public int PageSize { get; set; }

        public Page(int pageNumber = 1, int pageSize = 10)
        {
            this.PageNumber = pageNumber;
            this.PageSize = pageSize;
        }
        /// <summary>
        /// 要略过的数据
        /// </summary>
        public int Skip { get { return (PageNumber - 1) * PageSize; } }

    }
    /// <summary>
    /// 翻页对象
    /// </summary>
    public static class PagingExtensions
    {
        /// <summary>
        /// 扩展IQueryable的方法，让翻页变得更轻松
        /// </summary>
        /// <typeparam name="T">实体对象</typeparam>
        /// <param name="queryable">要分页的结果</param>
        /// <param name="page">分页对象</param>
        /// <returns>完成后的翻页对象</returns>
        public static IQueryable<T> GetPage<T>(this IQueryable<T> queryable, Page page)
        {
            return queryable.Skip(page.Skip).Take(page.PageSize);
        }
    }
}
