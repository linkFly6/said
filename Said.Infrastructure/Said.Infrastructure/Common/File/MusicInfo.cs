using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    /// <summary>
    /// 音乐文件信息类
    /// </summary>
    public class MusicInfo
    {
        /// <summary>
        /// 歌曲名称
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// 文件大小
        /// </summary>
        public int Size { get; set; }
        /// <summary>
        /// 文件类型
        /// </summary>
        public string Type { get; set; }
        /// <summary>
        /// 歌曲长度
        /// </summary>
        public string Length { get; set; }
        /// <summary>
        /// 艺术家
        /// </summary>
        public string Artists { get; set; }
        /// <summary>
        /// 专辑
        /// </summary>
        public string Album { get; set; }
        /// <summary>
        /// 比特率
        /// </summary>
        public string BitRate { get; set; }

    }
}
