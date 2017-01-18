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
    /// 管理员接口
    /// </summary>
    public interface IAdminService : IService<Admin>
    {

    } 
    #endregion


    #region Service
    /// <summary>
    /// 管理员服务
    /// </summary>
    public class AdminService : BaseService<Admin>, IAdminService
    {

        public AdminService(SaidDbContext context)
            : base(context)
        {

        }
    } 
    #endregion
}
