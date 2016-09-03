using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
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
        /// 匹配网站（不带参数的） HTTP
        /// </summary>
        private static Regex regHTTPSite = new Regex(@"^((https|http)?://)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((/?)|(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$");

        /// <summary>
        /// 匹配HTTP相关协议
        /// </summary>
        private static Regex regHTTPProtocol = new Regex(@"^http(?:s)?://");

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
            if (string.IsNullOrWhiteSpace(str)) return str;
            return HttpUtility.UrlDecode(str.Trim());
        }

        /// <summary>
        /// 检测一个uri是否是正确uri格式，判断了这些：
        /// 不允许包含参数的uri
        /// 长度小于60
        /// 不为空
        /// taSaid.com|://taSaid.com|www.taSaid.com
        /// https|http
        /// </summary>
        /// <param name="uri"></param>
        /// <returns></returns>
        public static bool CheckUri(string uri)
        {
            return !string.IsNullOrWhiteSpace(uri) && uri.Trim().Length <= 60 && regHTTPSite.IsMatch(uri.Trim());
        }

        /// <summary>
        /// 修正一个uri，要求uri不携带参数，如需要验证uri合法性，请使用 UrlCommon.CheckUri()，仅修正HTTP的
        /// 例如：
        /// said.com => http://taSaid.com 
        /// ://said.com => http://taSaid.com 
        /// </summary>
        /// <param name="uri"></param>
        /// <returns></returns>
        public static string ResolveHTTPUri(string uri)
        {
            if (uri.StartsWith("//"))
            {
                return "http:" + uri;
            }
            else if (uri.StartsWith("://"))
            {
                return "http" + uri;
            }
            else if (!regHTTPProtocol.IsMatch(uri))
            {
                return "http://" + uri;
            }
            else
                return uri;
        }
    }
}
