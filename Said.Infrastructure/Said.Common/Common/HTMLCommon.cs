using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Common
{
    /// <summary>
    /// HTML字符串帮助类
    /// </summary>
    public class HTMLCommon
    {

        #region
        private static readonly Regex HTMLTRIM = new Regex(@"<(\S*?) [^>]*>.*?</\1>|<.*? />", RegexOptions.Compiled);
        #endregion
        /// <summary>
        /// 修剪HTML字符串为纯粹字符串
        /// </summary>
        /// <returns>返回修剪后的字符串</returns>
        public static string HTMLTrim(string html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return string.Empty;
            return HTMLTRIM.Replace(html, string.Empty);
        }
    }
}
