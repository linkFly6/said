using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace Said.Common
{
    /// <summary>
    /// JavaScript辅助类
    /// </summary>
    public class JavaScriptCommon
    {
        /// <summary>
        /// 通用的JavaScriptSerializer对象
        /// </summary>
        public static JavaScriptSerializer scriptObject = new JavaScriptSerializer();
        /// <summary>
        /// 序列化一个对象到字符串
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static string Serialize(object model)
        {
            return scriptObject.Serialize(model);
        }

        /// <summary>
        /// 反序列化一个字符串到指定的对象
        /// </summary>
        /// <typeparam name="T">泛型</typeparam>
        /// <param name="str">要序列化的字符串</param>
        /// <returns></returns>
        public static T DeSerialize<T>(string str)
        {
            return scriptObject.Deserialize<T>(str);
        }

    }
}