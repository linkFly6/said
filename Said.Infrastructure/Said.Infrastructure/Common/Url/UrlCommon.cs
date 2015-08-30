using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// Url编码/解码帮助类
    /// </summary>
    public class UrlCommon
    {
        /// <summary>
        /// 反射一个对象，将这个对象所有的String类型的属性进行Decode
        /// </summary>
        /// <typeparam name="T">对象类型</typeparam>
        /// <param name="model">对象</param>
        /// <returns>返回重新编码后的对象</returns>
        public static T DecodeModel<T>(T model)
        {
            if (model == null) return model;
            PropertyInfo[] props = ModelCommon.GetPropertyInfoArray<T>();
            Type typeString = typeof(string);
            foreach (var item in props)
            {
                var temp = item.GetValue(model);
                if (item.SetMethod != null && item.PropertyType == typeString && temp != null)
                    item.SetValue(model, HttpUtility.UrlDecode(temp.ToString()));
            }
            return model;
        }


        /// <summary>
        /// 解码一个字符串
        /// </summary>
        /// <param name="str">要解码的字符串</param>
        /// <returns>解码后的字符串</returns>
        public static string Decode(string str)
        {
            if (string.IsNullOrEmpty(str)) return str;
            return HttpUtility.UrlDecode(str);
        }
    }
}
