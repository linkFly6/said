using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    #region Interface
    public interface IUserService : IService<User>
    {
        /// <summary>
        /// 根据条件检测用户是否存在，跳过EF缓存
        /// </summary>
        /// <param name="where"></param>
        /// <returns></returns>
        bool ExistsNoCache(Expression<Func<User, bool>> where);
    }

    #endregion


    #region Service
    public class UserService : BaseService<User>, IUserService
    {

        public UserService(DatabaseFactory factory)
            : base(factory)
        {
        }

        /// <summary>
        /// 根据条件检测用户是否存在，跳过EF缓存
        /// </summary>
        /// <param name="where"></param>
        /// <returns></returns>
        public bool ExistsNoCache(Expression<Func<User, bool>> where)
        {
            return Context.User.AsNoTracking().Count(where) > 0;
        }
    }
    #endregion
}
