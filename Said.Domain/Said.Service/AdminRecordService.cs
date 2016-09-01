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
    /// <summary>
    /// 管理员记录接口
    /// </summary>
    public interface IAdminRecordService : IService<AdminRecord>
    {
        /// <summary>
        /// 根据用户ID获取最后一次登录操作
        /// </summary>
        /// <param name="adminId">管理员ID</param>
        /// <returns></returns>
        IEnumerable<AdminRecord> GetByAdminLastDay(string adminId);

        /// <summary>
        /// 贪婪查询一条
        /// </summary>
        /// <param name="adminRecordId"></param>
        /// <returns></returns>
        AdminRecord GetAllInfo(Expression<Func<AdminRecord, bool>> where);
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

        /// <summary>
        /// 根据用户ID获取最后一次登录操作
        /// </summary>
        /// <returns></returns>
        public IEnumerable<AdminRecord> GetByAdminLastDay(string adminId)
        {
            //TODO 检测正确性
            var query = from m in base.Context.AdminRecord
                        where m.AdminId == adminId && (
                            from d in Context.AdminRecord
                            group d by d.Date into g
                            select g.Key.ToString("yyyyMMdd")
                            ).Contains(m.Date.ToString("yyyMMdd"))
                        select m;
            return query.ToList();
        }

        /// <summary>
        /// 贪婪查询一条
        /// </summary>
        /// <param name="where"></param>
        /// <returns></returns>
        public AdminRecord GetAllInfo(Expression<Func<AdminRecord, bool>> where)
        {
            return Context.AdminRecord.Include("Admin").Where(where).FirstOrDefault();
        }
    }
    #endregion
}
