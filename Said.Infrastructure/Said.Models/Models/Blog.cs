using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 日志类
    /// </summary>
    public class Blog : BaseModel
    {
        /// <summary>
        /// Blog Id
        /// </summary>
        [Key]
        public string BlogId { get; set; }

        /// <summary>
        /// XML
        /// </summary>
        public string BXML { get; set; }
        /// <summary>
        /// 标题
        /// </summary>
        public string BTitle { get; set; }
        /// <summary>
        /// 标签
        /// </summary>
        /// <summary>
        /// 标签集
        /// </summary>
        public virtual IList<Tag> Tag { get; set; }

        /// <summary>
        /// 修剪后的描述
        /// </summary>
        public string BSummaryTrim { get; set; }
        /// <summary>
        /// 描述
        /// </summary>
        public string BSummary { get; set; }
        /// <summary>
        /// 脚本（如果有的话）
        /// </summary>
        public string BScript { get; set; }
        /// <summary>
        /// 是否转载（0:否 1：是）
        /// </summary>
        public bool BReprint { get; set; }
        /// <summary>
        /// 浏览量
        /// </summary>
        public int BPV { get; set; }

        /// <summary>
        /// 文件名
        /// </summary>
        public string BName { get; set; }
        /// <summary>
        /// 最后一次评论的用户名
        /// </summary>
        public string BLastCommentUser { get; set; }
        /// <summary>
        /// 最有一次评论的内容
        /// </summary>
        public string BLastComment { get; set; }
        /// <summary>
        /// 是否置顶（0：否 1：是 2：所有类别置顶）
        /// </summary>
        public bool BIsTop { get; set; }
        /// <summary>
        /// 缩略图（裁剪过后缩放的）
        /// </summary>
        public string BImgTrim { get; set; }
        /// <summary>
        /// 缩略图（大图）
        /// </summary>
        public string BImg { get; set; }
        /// <summary>
        /// 文章HTML
        /// </summary>
        public string BHTML { get; set; }
        /// <summary>
        /// 文章发表时间
        /// </summary>
        public DateTime BDate { get; set; }

        /// <summary>
        /// CSS（如果有的话）
        /// </summary>
        public string BCSS { get; set; }
        /// <summary>
        /// 源码（markdown）
        /// </summary>
        [Required(ErrorMessage = "必须输入")]
        [Display(Name = "源码")]
        public string BContext { get; set; }
        /// <summary>
        /// 评论量
        /// </summary>
        [Required(ErrorMessage = "")]
        public int BComment { get; set; }
        /// <summary>
        /// 点击量
        /// </summary>
        public int BClick { get; set; }
        /// <summary>
        /// 类型ID
        /// </summary>
        public string ClassifyId { get; set; }

        /// <summary>
        /// 类型对象
        /// </summary>
        public virtual Classify Classify { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            if (string.IsNullOrWhiteSpace(BContext))
                yield return new ValidationResult("内容不允许为空");
            if (string.IsNullOrWhiteSpace(BTitle))
                yield return new ValidationResult("标题不允许为空");
            if (string.IsNullOrWhiteSpace(BSummary))
                yield return new ValidationResult("描述不允许为空");
            if (string.IsNullOrWhiteSpace(BImg))
                yield return new ValidationResult("图片不允许为空");
            //if (string.IsNullOrWhiteSpace(BTag))
            //    yield return new ValidationResult("标签不允许为空");
            if (Classify == null && string.IsNullOrEmpty(ClassifyId))
                yield return new ValidationResult("分类信息不允许为空");
        }
    }
}
