using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Threading.Tasks;

namespace Said.Dal
{
    /// <summary>
    /// 数据访问抽象类
    /// </summary>
    public abstract class IDBHelper
    {

        /// <summary>
        /// 增删改
        /// </summary>
        /// <param name="cmdType">执行类型</param>
        /// <param name="sql">sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        public abstract int ExecuteNonQuery(CommandType cmdType, string sql, params SqlParameter[] sp);
        /// <summary>
        /// 查询（返回多条）
        /// </summary>
        /// <param name="cmdType">执行类型</param>
        /// <param name="sql">sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        public abstract SqlDataReader ExecuteReader(CommandType cmdType, string sql, params SqlParameter[] sp);
        /// <summary>
        /// 查询（返回一条）
        /// </summary>
        /// <param name="cmdType">执行类型</param>
        /// <param name="sql">sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        public abstract object ExecuteScalar(CommandType cmdType, string sql, params SqlParameter[] sp);
    }
}
