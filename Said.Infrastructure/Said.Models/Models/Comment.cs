using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 评论表
    /// </summary>
    public class Comment : BaseModel
    {
        /// <summary>
        /// ID
        /// </summary>
        [Key]
        public string CommentId { get; set; }


        /// <summary>
        /// BlogId
        /// </summary>
        public string BlogId { get; set; }

        /// <summary>
        /// Blog
        /// </summary>
        public virtual Blog Blog { get; set; }

        /// <summary>
        /// 回复的用户Id
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 回复的用户
        /// </summary>
        public virtual User User { get; set; }


        /// <summary>
        /// 回复正文（源码）
        /// </summary>
        [MaxLength(300, ErrorMessage = "回复内容长度超过限制")]
        public string SourceContext { get; set; }


        /// <summary>
        /// 回复正文
        /// </summary>
        public string Context { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
