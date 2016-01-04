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
    /// User处理程序
    /// </summary>
    public static class UserApplication
    {
        private static IUserService service;
        public static IUserService Context
        {
            get { return service ?? (service = new UserService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一个User
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(User model)
        {
            Context.Add(model);
            return service.Submit();
        }


        /// <summary>
        /// 查找User
        /// </summary>
        /// <returns></returns>
        public static User Find(string id)
        {
            return Context.GetById(id);
        }

    }
}
