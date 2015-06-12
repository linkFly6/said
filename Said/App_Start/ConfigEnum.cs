using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said
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

        #endregion

        #region 默认Icons上传限制

        /// <summary>
        /// 默认分类Icons上传路径
        /// </summary>
        public const string SourceClassifyIcons = "source.classify.icons";

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

        #endregion


        #region 默认IP库位置
        /// <summary>
        /// 默认IP库位置
        /// </summary>
        public const string SourceDataIP = "source.data.ip";

        #endregion
    }
}