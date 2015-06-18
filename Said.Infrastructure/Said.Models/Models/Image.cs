using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 图片类
    /// </summary>
    public class Image : BaseModel
    {
        /// <summary>
        /// 图片ID
        /// </summary>
        public string ImageId { get; set; }
        /// <summary>
        /// 图片名称
        /// </summary>
        public string IName { get; set; }

        /// <summary>
        /// 图片文件名
        /// </summary>
        public string IFileName { get; set; }

        /// <summary>
        /// 图片大小
        /// </summary>
        public string ISize { get; set; }

        /// <summary>
        /// 上传日期
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// 图片类型
        /// </summary>
        public ImageType Type { get; set; }

        /// <summary>
        /// 上传用户ID
        /// </summary>
        public string UserID { get; set; }

        /// <summary>
        /// 上传用户
        /// </summary>
        public virtual User User { get; set; }

        public override IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
