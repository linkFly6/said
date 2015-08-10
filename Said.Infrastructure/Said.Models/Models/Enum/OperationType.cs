using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 用户操作行为枚举（操作行为重要级）
    /// </summary>
    public enum OperationType
    {
        /// <summary>
        /// 查询数据
        /// </summary>
        Select = 0,
        /// <summary>
        /// 修改数据
        /// </summary>
        Update = 1,
        /// <summary>
        /// 登录
        /// </summary>
        Login = 2,
        /// <summary>
        /// 创建数据
        /// </summary>
        Create = 3,
        /// <summary>
        /// 删除数据
        /// </summary>
        Delete = 4

    }
}
