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
    /// 回复表，针对评论（Comment）的回复
    /// </summary>
    public class Reply : BaseModel
    {
        /// <summary>
        /// ID
        /// </summary>
        [Key]
        public string ReplyId { get; set; }

        /// <summary>
        /// BlogId
        /// </summary>
        public string BlogId { get; set; }

        /// <summary>
        /// Blog
        /// </summary>
        public virtual Blog Blog { get; set; }

        /// <summary>
        /// 评论ID（Comment）
        /// </summary>
        public string CommentId { get; set; }

        /// <summary>
        /// 评论对象
        /// </summary>
        public virtual Comment Comment { get; set; }

        /// <summary>
        /// 回复的用户Id
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 回复的用户
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// 被回复的评论ID
        /// </summary>

        public string ToReplyId { get; set; }

        /// <summary>
        /// 被回复的评论，允许为空
        /// </summary>
        [ForeignKey("ToReplyId")]
        public Reply ToReply { get; set; }



        /// <summary>
        /// 回复正文（源码）
        /// </summary>
        [MaxLength(300, ErrorMessage = "回复内容长度超过限制")]
        public string SourceContext { get; set; }


        /// <summary>
        /// 回复正文
        /// </summary>
        public string Context { get; set; }


        /// <summary>
        /// 回复类型（0：针对评论的回复 1：针对回复的回复）
        /// </summary>
        public int ReplyType { get; set; }



        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
