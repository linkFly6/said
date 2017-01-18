using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    /// <summary>
    /// 横幅类接口
    /// </summary>
    public interface IBannerService : IService<Banner>
    {
        /// <summary>
        /// 获取指定数量的横幅（日期倒序）
        /// </summary>
        /// <returns></returns>
        IEnumerable<Banner> GetTop(int count);
    }

    /// <summary>
    /// 横幅类
    /// </summary>
    public class BannerService : BaseService<Banner>, IBannerService
    {
        public BannerService(SaidDbContext factory)
            : base(factory)
        {

        }

        /// <summary>
        /// 获取指定数量的横幅（日期倒序）
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Banner> GetTop(int count)
        {
            var query = from m in base.Context.Banner
                        where m.IsDel == 0
                        orderby m.Date descending
                        select m;
            return query.Take(count);
        }
    }
}
