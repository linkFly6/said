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
    public class AdminApplication : BaseApplication<Admin, IAdminService>
    {
        public AdminApplication() : base(new AdminService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }


        /// <summary>
        /// 获取用户
        /// </summary>
        /// <param name="name">用户名</param>
        /// <param name="password">用户密码</param>
        /// <returns></returns>
        public Admin Get(string name, string password)
        {
            return Context.Get(m => m.Name.ToLower() == name.ToLower() && m.Password == password);
        }

        /// <summary>
        /// 根据ID获取用户
        /// </summary>
        /// <param name="adminId"></param>
        /// <returns></returns>
        public Admin Get(string adminId)
        {
            return Context.Get(m => m.AdminId == adminId);
        }
    }
}
