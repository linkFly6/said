using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Config
{
    /// <summary>
    /// 配置枚举类
    /// </summary>
    public class ConfigEnum
    {
        #region 默认图片上传限制

        /// <summary>
        /// 默认最大图片上传大小（byte）
        /// </summary>
        public const string ImgMax = "images.maxSize";
        /// <summary>
        /// 默认图片过滤
        /// </summary>
        public const string ImgFilter = "images.filter";

        #endregion

        #region 默认音乐上传限制

        /// <summary>
        /// 默认音乐上传大小(byte)
        /// </summary>
        public const string MusicMaxSize = "music.maxSize";
        /// <summary>
        /// 默认图片过滤
        /// </summary>
        public const string MusicFilter = "music.filter";

        /// <summary>
        /// 默认音乐资源上传路径
        /// </summary>
        public const string MusicPath = "music";

        /// <summary>
        /// 默认音乐图片上传路径
        /// </summary>
        public const string MusicImage = "music.images";


        /// <summary>
        /// Said缩略图路径
        /// </summary>
        public const string MusicImagesThumbnail = "music.images.thumbnail";

        #endregion

        #region 默认Icons上传限制

        /// <summary>
        /// 默认Icons上传路径
        /// </summary>
        public const string SourceIcons = "source.sys.icons";

        /// <summary>
        /// 默认Icons上传大小
        /// </summary>
        public const string SourceIconsMaxSize = "source.sys.icons.maxSize";

        #endregion

        #region 默认Said图片上传

        /// <summary>
        /// 默认Said上传路径
        /// </summary>
        public const string SourceSaidImages = "source.said.images";
        /// <summary>
        /// 默认Said图片上传大小
        /// </summary>
        public const string SourceSaidImagesMaxSize = "source.said.images.maxSize";

        /// <summary>
        /// Said缩略图路径
        /// </summary>
        public const string SourceSaidImagesThumbnail = "source.said.images.thumbnail";
        #endregion


        #region 默认Blog图片上传

        /// <summary>
        /// Blog
        /// </summary>
        public const string SourceBlogImages = "source.blog.images";
        /// <summary>
        /// 默认Blog图片上传大小
        /// </summary>
        public const string SourceBlogImagesMaxSize = "source.blog.images.maxSize";

        /// <summary>
        /// Blog缩略图路径 
        /// </summary>
        public const string SourceBlogImagesThumbnail = "source.blog.images.thumbnail";
        #endregion


        #region 默认系统图（页面图）
        /// <summary>
        /// 系统图片路径
        /// </summary>
        public const string SystemImages = "source.sys.images";
        /// <summary>
        /// 系统图片上传大小
        /// </summary>
        public const string SystemImagesSize = "source.sys.images.maxSize";
        /// <summary>
        /// 系统缩略图路径
        /// </summary>
        public const string SystemImagesThumbnail = "source.sys.images.thumbnail";

        #endregion

        #region 资源删除路径
        public const string SystemDelete = "source.sys.delete";
        #endregion

        #region 默认IP库位置
        /// <summary>
        /// 默认IP库位置
        /// </summary>
        public const string SourceDataIP = "source.data.ip";

        #endregion
    }
}