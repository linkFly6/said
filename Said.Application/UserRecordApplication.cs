using Said.Models;
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
    }
}
