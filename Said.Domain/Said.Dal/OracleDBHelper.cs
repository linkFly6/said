using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Dal
{
    partial class OracleDBHelper : IDBHelper
    {
        public override int ExecuteNonQuery(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            throw new NotImplementedException();
        }
        public override System.Data.SqlClient.SqlDataReader ExecuteReader(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            throw new NotImplementedException();
        }
        public override object ExecuteScalar(System.Data.CommandType cmdType, string sql, params System.Data.SqlClient.SqlParameter[] sp)
        {
            throw new NotImplementedException();
        }
    }
}
