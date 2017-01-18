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
    }
}
