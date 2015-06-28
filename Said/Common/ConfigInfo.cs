using Said.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// Said配置读取类
    /// </summary>
    public static class ConfigInfo
    {
        #region 配置

        /// <summary>
        /// 图片过滤
        /// </summary>
        public readonly static Array ImageFileterArray = ConfigTable.Get(ConfigEnum.ImgFilter).Split(',');
        /// <summary>
        /// 音乐文件过滤
        /// </summary>
        public readonly static Array MusicFilterArray = ConfigTable.Get(ConfigEnum.MusicFilter).Split(',');

        /// <summary>
        /// Blog上传的图片路径
        /// </summary>
        public readonly static string SourceBlogPath = ConfigTable.Get(ConfigEnum.SourceBlogImages);

        /// <summary>
        /// Said上传的图片路径
        /// </summary>
        public readonly static string SourceSaidPath = ConfigTable.Get(ConfigEnum.SourceSaidImages);

        /// <summary>
        /// 音乐上传的路径
        /// </summary>
        public readonly static string SourceMusicPath = ConfigTable.Get(ConfigEnum.MusicPath);

        /// <summary>
        /// 音乐图片的路径
        /// </summary>
        public readonly static string SourceMusicImagePath = ConfigTable.Get(ConfigEnum.MusicImage);

        /// <summary>
        /// Icon上传的路径
        /// </summary>
        public readonly static string SourceIconsPath = ConfigTable.Get(ConfigEnum.SourceIcons);

        /// <summary>
        /// 系统图片上传的路径
        /// </summary>
        public readonly static string SourceSystemPath = ConfigTable.Get(ConfigEnum.SystemImages);

        /// <summary>
        /// 资源删除后存放的路径
        /// </summary>
        public readonly static string SourceSystemDelete = ConfigTable.Get(ConfigEnum.SystemDelete);


        /// <summary>
        /// Blog允许的最大上传图片
        /// </summary>
        public readonly static int SizeBlogImage = int.Parse(ConfigTable.Get(ConfigEnum.SourceBlogImagesMaxSize));

        /// <summary>
        /// Said允许的最大图片
        /// </summary>
        public readonly static int SizeSaidImage = int.Parse(ConfigTable.Get(ConfigEnum.SourceBlogImagesMaxSize));

        /// <summary>
        /// Music允许的最大图片
        /// </summary>
        public readonly static int SizeMusic = int.Parse(ConfigTable.Get(ConfigEnum.MusicMaxSize));

        /// <summary>
        /// Icons允许的最大图片
        /// </summary>
        public readonly static int SizeIcons = int.Parse(ConfigTable.Get(ConfigEnum.SourceIconsMaxSize));

        /// <summary>
        /// 系统图片允许的最大上传大小
        /// </summary>
        public readonly static int SizeSystem = int.Parse(ConfigTable.Get(ConfigEnum.SystemImagesSize));

        #endregion
    }
}