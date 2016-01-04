using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    #region Interface
    public interface IUserService : IService<User>
    {

    }

    #endregion


    #region Service
    public class UserService : BaseService<User>, IUserService
    {

        public UserService(DatabaseFactory factory)
            : base(factory)
        { }
    }
    #endregion
}
