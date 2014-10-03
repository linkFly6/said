using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.DataHelper.DBHelper
{
    /// <summary>
    /// 数据库实例枚举
    /// </summary>
    public enum DBType
    {
        /// <summary>
        /// SqlServer实例
        /// </summary>
        SqlServer = 0,
        /// <summary>
        /// Oracle实例
        /// </summary>
        Oracle = 1,
        /// <summary>
        /// MySql实例
        /// </summary>
        MySql = 2
    }
}
