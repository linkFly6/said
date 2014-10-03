using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    class CommonType
    {
    }
    /// <summary>
    /// 枚举：数据状态
    /// </summary>
    public enum IsState
    {
        /// <summary>
        /// 正常
        /// </summary>
        OK = 0,
        /// <summary>
        /// 锁定
        /// </summary>
        Lock = 1,
        /// <summary>
        /// 停用
        /// </summary>
        Stop = 2
    }
    /// <summary>
    /// 枚举：性别
    /// </summary>
    public enum Gender
    {
        /// <summary>
        /// 未知
        /// </summary>
        Unknown = 0,
        /// <summary>
        /// 男
        /// </summary>
        Male = 1,
        /// <summary>
        /// 女
        /// </summary>
        Female = 2
    }
}
