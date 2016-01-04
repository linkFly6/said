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

        #region 增删改
        /// <summary>
        /// 新增一条管理员操作记录
        /// </summary>
        /// <param name="model">管理员操作记录对象</param>
        /// <returns>返回自增的AdminRecordId</returns>
        public static int Add(AdminRecord model)
        {
            Context.Add(model);
            return Context.Submit();
        }
        #endregion

        /// <summary>
        /// 根据ID获取一条记录
        /// </summary>
        /// <returns></returns>
        public static AdminRecord Get(string recordId)
        {
            return Context.Get(m => m.AdminRecordId == recordId);
        }



        /// <summary>
        /// 根据用户ID获取最后一次登录操作
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<AdminRecord> GetByAdminLastDay(string adminId)
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
