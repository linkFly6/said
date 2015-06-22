﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 图片类型枚举
    /// </summary>
    public enum ImageType
    {
        /// <summary>
        /// 系统图
        /// </summary>
        System = 0,
        /// <summary>
        /// Blog图
        /// </summary>
        Blog = 1,
        /// <summary>
        /// Said图
        /// </summary>
        Said = 2,
        /// <summary>
        /// Icon
        /// </summary>
        Icon = 3,
        /// <summary>
        /// 页面引用图
        /// </summary>
        Page = 4,
        /// <summary>
        /// 实验室图
        /// </summary>
        Lab = 5,
        /// <summary>
        /// 其他图
        /// </summary>
        Other = 6
    }
}