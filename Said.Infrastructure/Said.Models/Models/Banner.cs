using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 首页横幅类
    /// </summary>
    public class Banner : BaseModel
    {
        /// <summary>
        /// BannerId
        /// </summary>
        public string BannerId { get; set; }

        /// <summary>
        /// 横幅主题（颜色） 0：白色 1：暗色
        /// </summary>
        public int Theme { get; set; }

        /// <summary>
        /// 转换的HTML
        /// </summary>
        public string HTML { get; set; }

        /// <summary>
        /// 源码
        /// </summary>
        public string SourceCode { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 图片Id
        /// </summary>
        public string ImageId { get; set; }

        /// <summary>
        /// 图片
        /// </summary>
        public virtual Image Image { get; set; }

        /// <summary>
        /// 链接
        /// </summary>
        public string Link { get; set; }

        public override IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
