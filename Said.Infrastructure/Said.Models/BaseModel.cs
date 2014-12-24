using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    ///  DTD 基类
    /// </summary>
    public abstract class BaseModel
    {
        /// <summary>
        /// 数据状态（0：正常 1：已删除）
        /// </summary>
        public int IsDel { get; set; }

        /// <summary>
        /// 实体验证方法
        /// </summary>
        /// <param name="validationContext">验证上下文</param>
        /// <returns>验证结果迭代器</returns>
        public abstract IEnumerable<ValidationResult> Validate();

    }
}
