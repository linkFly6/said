using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    public class Tag : BaseModel
    {
        /// <summary>
        /// TagID
        /// </summary>
        [Key, Column(Order = 0)]
        public string TagId { get; set; }
        /// <summary>
        /// 标签名，采用复合主键做唯一约束
        /// </summary>
        [Key, Column(Order = 1)]
        public string TagName { get; set; }

        /// <summary>
        /// 引用个数
        /// </summary>
        public int Count { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
