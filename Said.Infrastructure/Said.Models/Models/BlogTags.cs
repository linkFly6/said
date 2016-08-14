using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// Blog和Tag关系表
    /// </summary>
    public class BlogTags : BaseModel
    {
        /// <summary>
        /// ID
        /// </summary>
        [Key]
        public string BlogTagsId { get; set; }



        /// <summary>
        /// BlogId
        /// </summary>
        public string BlogId { get; set; }

        /// <summary>
        /// Blog
        /// </summary>
        [ForeignKey("BlogId")]
        public virtual Blog Blog { get; set; }

        /// <summary>
        /// 标签ID
        /// </summary>
        public string TagId { get; set; }

        /// <summary>
        /// TagID
        /// </summary>
        [ForeignKey("TagId")]
        public virtual Tag Tag { get; set; }


        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
