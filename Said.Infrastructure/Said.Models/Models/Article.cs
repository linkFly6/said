using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 听说（文章）
    /// </summary>
    public class Article : BaseModel
    {
        /// <summary>
        /// Said Id
        /// </summary>
        [Key]
        public string SaidId { get; set; }
        /// <summary>
        /// XML
        /// </summary>
        public string SXML { get; set; }
        /// <summary>
        /// 标题
        /// </summary>
        public string STitle { get; set; }
        /// <summary>
        /// 标签
        /// </summary>
        public string STag { get; set; }
        /// <summary>
        /// 修剪后的描述
        /// </summary>
        public string SSummaryTrim { get; set; }
        /// <summary>
        /// 描述
        /// </summary>
        public string SSummary { get; set; }
        ///// <summary>
        ///// 歌曲ID
        ///// </summary>
        //public string SSongId { get; set; }
        /// <summary>
        /// 脚本（如果有的话）
        /// </summary>
        public string SScript { get; set; }
        /// <summary>
        /// 是否转载（0:否 1：是）
        /// </summary>
        public bool SReprint { get; set; }
        /// <summary>
        /// 浏览量
        /// </summary>
        public int SPV { get; set; }

        /// <summary>
        /// 文件名
        /// </summary>
        public string SName { get; set; }
        /// <summary>
        /// 最后一次评论的用户名
        /// </summary>
        public string SLastCommentUser { get; set; }
        /// <summary>
        /// 最有一次评论的内容
        /// </summary>
        public string SLastComment { get; set; }
        /// <summary>
        /// 是否置顶（0：否 1：是 2：所有类别置顶）
        /// </summary>
        public bool SIsTop { get; set; }
        /// <summary>
        /// 缩略图
        /// </summary>
        public virtual Image Image { get; set; }

        /// <summary>
        /// 缩略图ID
        /// </summary>
        public string ImageId { get; set; }


        /// <summary>
        /// 文章HTML
        /// </summary>
        public string SHTML { get; set; }

        /// <summary>
        /// JS（如果有的话）
        /// </summary>
        public string SJS { get; set; }
        /// <summary>
        /// CSS（如果有的话）
        /// </summary>
        public string SCSS { get; set; }
        /// <summary>
        /// 源码（markdown）
        /// </summary>
        [Required(ErrorMessage = "必须输入")]
        [Display(Name = "源码")]
        public string SContext { get; set; }
        /// <summary>
        /// 评论量
        /// </summary>
        [Required(ErrorMessage = "")]
        public int SComment { get; set; }
        /// <summary>
        /// 点击量
        /// </summary>
        public int SClick { get; set; }
        ///// <summary>
        ///// 类型ID
        ///// </summary>
        //public string ClassifyId { get; set; }

        ///// <summary>
        ///// 类型对象
        ///// </summary>
        //public virtual Classify Classify { get; set; }

        /// <summary>
        /// 访问密码
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// 是否私有
        /// </summary>
        public int IsPrivate { get; set; }

        /// <summary>
        /// Like数
        /// </summary>
        public int Likes { get; set; }

        /// <summary>
        /// 歌曲ID
        /// </summary>
        public string SongId { get; set; }

        /// <summary>
        /// 歌曲
        /// </summary>
        public virtual Song Song { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            if (string.IsNullOrWhiteSpace(SContext))
                yield return new ValidationResult("内容不允许为空");
            if (string.IsNullOrWhiteSpace(STitle))
                yield return new ValidationResult("标题不允许为空");
            if (string.IsNullOrWhiteSpace(SSummary))
                yield return new ValidationResult("描述不允许为空");
            else if (Song != null)
            {
                if (string.IsNullOrWhiteSpace(Song.ImageId))
                    yield return new ValidationResult("歌曲图片不允许为空");
                //if (string.IsNullOrWhiteSpace(Song.SongArtist))
                //    yield return new ValidationResult("歌手不允许为空");
                //if (string.IsNullOrWhiteSpace(Song.SongAlbum))
                //    yield return new ValidationResult("歌曲专辑不允许为空");
                if (string.IsNullOrWhiteSpace(Song.SongName))
                    yield return new ValidationResult("歌曲名称不允许为空");
            }
        }
    }
}
