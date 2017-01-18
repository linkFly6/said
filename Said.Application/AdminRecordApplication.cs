using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    /// <summary>
    /// 管理员记录操作中心
    /// </summary>
    public class AdminRecordApplication : BaseApplication<AdminRecord, IAdminRecordService>
    {
        #region 上下文

        public AdminRecordApplication() : base(new AdminRecordService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }
        #endregion

        /// <summary>
        /// 根据ID获取一条记录（贪婪获取）
        /// </summary>
        /// <returns></returns>
        public AdminRecord Get(string recordId)
        {
            //return Context.Get(m => m.AdminRecordId == recordId);
            return Context.GetAllInfo(m => m.AdminRecordId == recordId);
        }



        /// <summary>
        /// 根据用户ID获取最后一次登录操作
        /// </summary>
        /// <returns></returns>
        public IEnumerable<AdminRecord> GetByAdminLastDay(string adminId)
        {
            return Context.GetByAdminLastDay(adminId);
        }

        ///// <summary>
        ///// 根据用户获取多条记录
        ///// </summary>
        ///// <returns></returns>
        //public static AdminRecord Get(string adminId)
        //{
        //    return null;
        //}
    }
}
