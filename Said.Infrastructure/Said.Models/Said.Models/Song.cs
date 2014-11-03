using System;
using System.Collections.Generic;
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
        public string SongId { get; set; }
        /// <summary>
        /// 歌曲URL
        /// </summary>
        public string SongUrl { get; set; }
        /// <summary>
        /// 歌曲名称
        /// </summary>
        public string SongName { get; set; }
        /// <summary>
        /// 歌曲Like数量
        /// </summary>
        public string SongLikeCount { get; set; }
        /// <summary>
        /// 歌曲图片
        /// </summary>
        public string SongImg { get; set; }
        /// <summary>
        /// 歌手
        /// </summary>
        public string SongArtist { get; set; }
        /// <summary>
        /// 歌曲专辑
        /// </summary>
        public string SongAlbum { get; set; }
    }
}
