using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Helper
{
    class HttpHelper
    {
        /// <summary>
        /// 获取当前访问用户的IP地址
        /// 代码摘自：http://blog.csdn.net/lybwwp/article/details/42110523
        /// </summary>
        /// <returns></returns>
        public static string IP()
        {
            string result = System.Web.HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            if (!string.IsNullOrWhiteSpace(result))//判断是否有代理
            {
                //没有"." 肯定是非IP格式  
                if (result.IndexOf(".") == -1)
                {
                    result = null;
                }
                else
                {
                    //有","，估计多个代理。取第一个不是内网的IP。  
                    if (result.IndexOf(",") != -1)
                    {
                        result = result.Replace(" ", string.Empty).Replace("\"", string.Empty);
                        string[] temparyip = result.Split(",;".ToCharArray());
                        if (temparyip != null && temparyip.Length > 0)
                        {
                            for (int i = 0; i < temparyip.Length; i++)
                            {
                                //找到不是内网的地址  
                                if (IsIPAddress(temparyip[i]) && temparyip[i].Substring(0, 3) != "10." && temparyip[i].Substring(0, 7) != "192.168" && temparyip[i].Substring(0, 7) != "172.16.")
                                {
                                    return temparyip[i];
                                }
                            }
                        }
                    }
                    //代理即是IP格式  
                    else if (IsIPAddress(result))
                    {
                        return result;
                    }
                    //代理中的内容非IP  
                    else
                    {
                        result = null;
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(result))
            {
                result = System.Web.HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];
            }

            if (string.IsNullOrWhiteSpace(result))
            {
                result = System.Web.HttpContext.Current.Request.UserHostAddress;
            }
            return result;
        }



        /// <summary>
        /// 访问互联网的Web API，并返回结果
        /// </summary>
        /// <param name="url">要访问的url</param>
        /// <returns>该API返回的结果</returns>
        public static string ReadWebAPI(string url)
        {
            if (UrlExistsUsingSockets(url))
            {
                WebRequest wreq = WebRequest.Create(url);
                using (WebResponse wresp = (WebResponse)wreq.GetResponse())
                {
                    Stream s = wresp.GetResponseStream();
                    StreamReader sr = new StreamReader(s, System.Text.Encoding.GetEncoding("utf-8"));
                    return sr.ReadToEnd();
                }
            }
            return string.Empty;
        }

        /// <summary>
        /// 检测远程URL是否存在
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private static bool UrlExistsUsingSockets(string url)
        {
            if (url.StartsWith("http://")) url = url.Remove(0, "http://".Length);
            try
            {
                IPHostEntry ipHost = Dns.GetHostEntry(url); //GetHostEntry
                return true;
            }
            catch (System.Net.Sockets.SocketException se)
            {
                System.Diagnostics.Trace.Write(se.Message);
                return false;
            }
        }


        /// <summary>
        /// 判断一个字符串是不是IP地址
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static bool IsIPAddress(string str)
        {
            if (string.IsNullOrWhiteSpace(str) || str.Length < 7 || str.Length > 15)
                return false;
            string regformat = @"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})";
            Regex regex = new Regex(regformat, RegexOptions.IgnoreCase);
            return regex.IsMatch(str);
        }
    }
}
