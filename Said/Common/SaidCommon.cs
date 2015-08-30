using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said
{
    /// <summary>
    /// Said全局帮助类
    /// </summary>
    public class SaidCommon
    {
        /// <summary>
        /// 创建一个对象ID（新增对象的时候）
        /// </summary>
        /// <returns></returns>
        public static string CreateId()
        {
            return Guid.NewGuid().ToString().Replace("-", "");
        }

        /// <summary>
        /// 获取一个符合Said要求的GUID（剔除"-"号），作为新增对象使用，每次获取都会生成
        /// </summary>
        public static string GUID
        {
            get { return CreateId(); }
        }

    }
}