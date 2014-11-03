using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Said.Dal;

namespace Said.Dal
{
    /// <summary>
    /// 数据库实例访问工厂
    /// </summary>
    internal static class DataFactory
    {
        #region 根据指定的枚举返回数据库访问实例对象
        /// <summary>
        /// 根据指定的枚举返回数据库访问实例对象
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static IDBHelper Get(DBType type = DBType.SqlServer)
        {
            switch (type)
            {
                case DBType.SqlServer:
                    return new SqlDBHelper();
                case DBType.Oracle:
                    return new OracleDBHelper();
                case DBType.MySql:
                    return new MySqlDBHelper();
            }
            return new SqlDBHelper();
        }
        #endregion
    }
}
