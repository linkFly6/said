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
    public interface IUserRecordService : IService<UserRecord>
    {

    }

    #endregion


    #region Service
    public class UserRecordService : BaseService<UserRecord>, IUserRecordService
    {
        public UserRecordService(SaidDbContext context)
            : base(context)
        { }

    }
    #endregion
}
