using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    ///  DTD 基类
    /// </summary>
    public class BaseModel
    {
        /// <summary>
        /// 数据状态（0：正常 1：已删除）
        /// </summary>
        public int IsDel { get; set; }
    }
}
