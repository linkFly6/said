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
    public static class AdminRecordApplication
    {
        #region 上下文
        private static IAdminRecordService service;

        public static IAdminRecordService Context
        {
            get { return service ?? (service = new AdminRecordService(new Domain.Said.Data.DatabaseFactory())); }
        }
        #endregion

        /// <summary>
        /// 根据ID获取一条记录
        /// </summary>
        /// <returns></returns>
        public static AdminRecord Get()
        {
            return null;
        }

        /// <summary>
        /// 根据用户获取多条记录
        /// </summary>
        /// <returns></returns>
        public static AdminRecord Get(string adminId)
        {
            return null;
        }
    }
}
