using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 歌曲
    /// </summary>
    public class Song : BaseModel
    {
        /// <summary>
        /// 歌曲ID
        /// </summary>
        [Key]
        public string SongId { get; set; }
        /// <summary>
        /// 歌曲URL
        /// </summary>
        [MaxLength(255, ErrorMessage = "")]
        public string SongUrl { get; set; }
        /// <summary>
        /// 歌曲名称
        /// </summary>
        public string SongName { get; set; }
        /// <summary>
        /// 歌曲Like数量
        /// </summary>
        public int SongLikeCount { get; set; }

        /// <summary>
        /// 被引用次数
        /// </summary>
        public int ReferenceCount { get; set; }

        /// <summary>
        /// 文件类型
        /// </summary>
        public string FileType { get; set; }

        public int SongSize { get; set; }

        /// <summary>
        /// 歌手
        /// </summary>
        public string SongArtist { get; set; }
        /// <summary>
        /// 歌曲专辑
        /// </summary>
        public string SongAlbum { get; set; }

        /// <summary>
        /// 创建日期
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// 发布日期
        /// </summary>
        public DateTime ReleaseDate { get; set; }

        /// <summary>
        /// 音乐时长
        /// </summary>
        public int Duration { get; set; }


        /// <summary>
        /// 音乐图片ID
        /// </summary>
        public string ImageId { get; set; }

        /// <summary>
        /// 音乐图片
        /// </summary>
        public virtual Image Image { get; set; }

        /// <summary>
        /// 歌曲文件名
        /// </summary>
        public string SongFileName { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            if (string.IsNullOrEmpty(SongUrl))
                yield return new ValidationResult("歌曲URL不能为空");

        }
        //缺少一个通用实体验证方法
    }
}
