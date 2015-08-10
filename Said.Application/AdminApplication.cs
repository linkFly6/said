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
    /// 管理员操作中心
    /// </summary>
    public static class AdminApplication
    {
        #region 上下文
        private static IAdminService service;

        public static IAdminService Context
        {
            get { return service ?? (service = new AdminService(new Domain.Said.Data.DatabaseFactory())); }
        }
        #endregion

        /// <summary>
        /// 获取用户
        /// </summary>
        /// <param name="name">用户名</param>
        /// <param name="password">用户密码</param>
        /// <returns></returns>
        public static Admin Get(string name, string password)
        {
            return Context.Get(m => m.Name.ToLower() == name.ToLower() && m.Password == password);
        }
    }
}
