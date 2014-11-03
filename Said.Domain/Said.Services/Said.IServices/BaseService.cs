using Said.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services.Said.IServices
{
    public class BaseService<T> where T : BaseModel
    {
        /// <summary>
        /// 查询多个通用接口
        /// </summary>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        protected IList<T> Find(string sql, params SqlParameter[] sp)
        {
            return null;
        }
        /// <summary>
        /// 查询单个通用接口
        /// </summary>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        protected T One(string sql, params SqlParameter[] sp)
        {
            return null;
        }
    }
}
