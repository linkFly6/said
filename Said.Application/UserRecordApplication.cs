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
    public class UserRecordApplication
    {
        private static IUserRecordService service;
        public static IUserRecordService Context
        {
            get { return service ?? (service = new UserRecordService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一个用户记录
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(UserRecord model)
        {
            Context.Add(model);
            return service.Submit();
        }


        /// <summary>
        /// 查找一条用户记录
        /// </summary>
        /// <returns></returns>
        public static UserRecord Find(string id)
        {
            return Context.GetById(id);
        }


        /// <summary>
        /// 分页查找用户访问记录
        /// </summary>
        /// <returns></returns>
        public static IPagedList<UserRecord> Find(Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }


        /// <summary>
        /// 分页查找用户访问记录（时间段）
        /// </summary>
        /// <returns></returns>
        public static IPagedList<UserRecord> Find(Page page, DateTime startDate, DateTime endDate)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Date >= startDate && m.Date <= endDate, m => m.Date);
        }
    }
}
