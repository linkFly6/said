using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
namespace Said.Dal
{
    /// <summary>
    /// Sql Server数据库访问
    /// </summary>
    partial class SqlDBHelper : IDBHelper
    {
        /// <summary>
        /// Sql连接字符串
        /// </summary>
        private readonly string SQLCONNECTIONSTR = ConfigurationManager.ConnectionStrings["SqlConnectionStr"].ConnectionString;

        /// <summary>
        /// 返回数据库连接对象实例
        /// </summary>
        /// <returns></returns>
        private SqlConnection GetConnection() { return new SqlConnection(SQLCONNECTIONSTR); }

        #region 增删改
        /// <summary>
        /// 增删改
        /// </summary>
        /// <param name="cmdType"></param>
        /// <param name="sql"></param>
        /// <param name="sp"></param>
        /// <returns></returns>
        public override int ExecuteNonQuery(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            int result = 0;
            SqlConnection conn = GetConnection();
            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.CommandType = cmdType;
                cmd.Parameters.AddRange(sp);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            return result;
        }

        #endregion

        #region 查询多条
        public override SqlDataReader ExecuteReader(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            SqlConnection conn = GetConnection();
            SqlCommand Comm = new SqlCommand(sql, conn);
            Comm.CommandType = cmdType;
            if (sp != null)
                Comm.Parameters.AddRange(sp);
            conn.Open();
            return Comm.ExecuteReader(CommandBehavior.CloseConnection);//如果Reader关闭，则自动关闭数据库连接
        }
        #endregion

        #region 查询一条
        public override object ExecuteScalar(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            object result = null;
            SqlConnection conn = GetConnection();
            using (SqlCommand Comm = new SqlCommand(sql, conn))
            {
                Comm.CommandType = cmdType;
                Comm.Parameters.AddRange(sp);
                conn.Open();
                result = Comm.ExecuteScalar();
            }
            return result;
        }
        #endregion
    }
}
