using PagedList;
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
    public class UserRecordApplication : BaseApplication<UserRecord, IUserRecordService>
    {
        public UserRecordApplication() : base(new UserRecordService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 查找一条用户记录
        /// </summary>
        /// <returns></returns>
        public UserRecord Find(string id)
        {
            return Context.GetById(id);
        }


        /// <summary>
        /// 分页查找用户访问记录（时间段）
        /// </summary>
        /// <returns></returns>
        public IPagedList<UserRecord> FindByTimeSpan(Page page, DateTime startDate, DateTime endDate)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Date >= startDate && m.Date <= endDate, m => m.Date);
        }

        /// <summary>
        /// 分页查找用户访问记录，并筛选数据类型
        /// </summary>
        /// <returns></returns>
        public IPagedList<UserRecord> FindByPageDesc(int filterType, Page page)
        {
            switch (filterType)
            {
                // 不过滤阿里云数据
                case 1:
                    return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
                // 默认过滤阿里云云盾数据，UA 为 Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;Alibaba.Security.Heimdall.3980811
                default:
                    return Context.GetPageDesc(page, m => m.IsDel == 0 && !m.UserAgent.Contains("Alibaba.Security.Heimdall"), m => m.Date); //Alibaba.Security.Heimdall
            }
        }

        /// <summary>
        /// 分页查找用户访问记录（时间段），并筛选数据类型
        /// </summary>
        /// <returns></returns>
        public IPagedList<UserRecord> FindByTimeSpan(int filterType, Page page, DateTime startDate, DateTime endDate)
        {
            switch (filterType)
            {
                // 不过滤阿里云数据
                case 1:
                    return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Date >= startDate && m.Date <= endDate, m => m.Date);
                // 默认过滤阿里云云盾数据，UA 为 Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;Alibaba.Security.Heimdall.3980811
                default:
                    return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Date >= startDate && m.Date <= endDate && !m.UserAgent.Contains("Alibaba.Security.Heimdall"), m => m.Date); //Alibaba.Security.Heimdall
            }
        }
    }
}
