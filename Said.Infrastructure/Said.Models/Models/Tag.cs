using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Infrastructure.Said.Models.Models
{
    public class Tag
    {
        /// <summary>
        /// TagID
        /// </summary>
        [Key]
        public string TagId { get; set; }
        /// <summary>
        /// 标签名
        /// </summary>
        public string TagName { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// 引用个数
        /// </summary>
        public int Count { get; set; }
    }
}
