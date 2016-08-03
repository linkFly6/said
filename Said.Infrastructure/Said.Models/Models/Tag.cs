using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        [Key]
        public string TagId { get; set; }
        /// <summary>
        /// 标签名
        /// </summary>
        public string TagName { get; set; }

        /// <summary>
        /// 引用个数
        /// </summary>
        public int Count { get; set; }

        //延迟加载Blog
        public virtual ICollection<Blog> Blogs { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
