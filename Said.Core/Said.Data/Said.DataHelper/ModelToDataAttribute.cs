using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.DataHelper
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class ModelToDataAttribute : Attribute
    {
        /// <summary>
        /// 对应列名
        /// </summary>
        public string ColumnName { get; set; }
        /// <summary>
        /// 是否主键
        /// </summary>
        public bool IsPrimaryKey { get; set; }
        /// <summary>
        /// 是否非空字段
        /// </summary>
        public bool IsNotNull { get; set; }
        /// <summary>
        /// 是否自动增长
        /// </summary>
        public bool IsIdentity { get; set; }
    }
}
