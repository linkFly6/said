using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 2014-08-05 23:53:44
    /// [听闻]表
    /// version:1.0
    /// author:linkFLy
    /// </summary>
    public class Said_Different
    {
        /// <summary>
        /// ID
        /// </summary>
        public string Different_Id { get; set; }
        private int different_Date;

        /// <summary>
        /// 发布时间
        /// </summary>
        public DateTime Different_Date { get; set; }
        /// <summary>
        /// 标题[HTML]
        /// </summary>
        public string Different_Title { get; set; }
        /// <summary>
        /// 内容[HTML]
        /// </summary>
        public string Different_Context { get; set; }
        /// <summary>
        /// 图片Url
        /// </summary>
        public string Different_Img { get; set; }
        /// <summary>
        /// 文件名
        /// </summary>
        public string Different_Name { get; set; }
        /// <summary>
        /// 状态：0 - 每次访问生成 1 - 静态访问 2 - 仅生成XML并读取
        /// </summary>
        public int Different_Status { get; set; }
        /// <summary>
        /// 音乐地址，如果是多个则按照<url><url2>解析
        /// </summary>
        public string Different_Music { get; set; }
        /// <summary>
        /// XML，添加的时候自动生成
        /// </summary>
        public string Different_XML { get; set; }
        /// <summary>
        /// 标签，多个标签按照空格,解析
        /// </summary>
        public string Different_Tag { get; set; }
        /// <summary>
        /// 分享次数
        /// </summary>
        public int Different_ShareCount { get; set; }
        /// <summary>
        /// 页面浏览量
        /// </summary>
        public int Different_LoadCount { get; set; }
        /// <summary>
        /// 喜欢次数
        /// </summary>
        public int Different_LikeCount { get; set; }
        /// <summary>
        /// 收藏次数
        /// </summary>
        public int Different_StarCount { get; set; }

        /// <summary>
        /// 状态标志 - 0：正常状态   1：锁定状态 2：停止状态
        /// </summary>
        public int IsState { get; set; }
    }
}
