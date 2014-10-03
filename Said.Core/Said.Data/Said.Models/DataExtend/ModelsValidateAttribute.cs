using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Models.DataExtend
{
    /// <summary>
    /// Said模型验证属性模板
    /// </summary>
    [AttributeUsage(AttributeTargets.All, AllowMultiple = true)]
    public class ModelsValidateAttribute : Attribute
    {
        /// <summary>
        /// 验证类型
        /// </summary>
        public ValidateType ValidateType { get; set; }

        /// <summary>
        /// 最大值
        /// </summary>
        public int MaxValue { get; set; }
        /// <summary>
        /// 最小值
        /// </summary>
        public int MinValue { get; set; }
        /// <summary>
        /// 范围验证
        /// </summary>
        public string[] Range { get; set; }
        /// <summary>
        /// 正则验证
        /// </summary>
        public Regex Reg { get; set; }
        /// <summary>
        /// 长度验证
        /// </summary>
        public int Length { get; set; }
        /// <summary>
        /// 字段名称
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// 字段值
        /// </summary>
        public string Discription { get; set; }
    }
}
