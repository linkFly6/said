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
    /// <summary>
    /// 管理员记录接口
    /// </summary>
    public interface IAdminRecordService : IService<AdminRecord>
    {

    }
    #endregion


    #region Service
    /// <summary>
    /// 管理员记录服务
    /// </summary>
    public class AdminRecordService : BaseService<AdminRecord>, IAdminRecordService
    {
        public AdminRecordService(DatabaseFactory factory)
            : base(factory)
        {

        }
    }
    #endregion
}
