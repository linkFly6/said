using Said.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace Said.Common
{
    public class IPRange
    {
        private static string[][] ips;
        /// <summary>
        /// IP段(交错数组)
        /// </summary>
        public static string[][] IPs
        {
            get
            {
                ips = ips ?? Load();
                return ips;
            }
        }


        /// <summary>
        /// 读取IP段配置
        /// </summary>
        /// <returns></returns>
        private static string[][] Load()
        {
            if (IPs != null) return IPs;
            //172.0.0.1;192.168.1.1-192.168.1.2
            string[] ipStr = ConfigTable.Get(ConfigEnum.IPRange).Split(';');
            ips = new string[ipStr.Length][];
            for (int i = 0; i < ipStr.Length; i++)
            {
                //ips[i] = ipStr[i].Split('-');
                //ips[i] = ipStr[i].Split('-')[0];
                UInt32.Parse(IPAddress.Parse("").GetAddressBytes());
            }

            System.Net.IPAddress.Parse("").GetAddressBytes();
            return ips;

        }


        /// <summary>
        /// 检测一个IP是否在配置允许的IP段内
        /// </summary>
        /// <param name="ip"></param>
        /// <returns></returns>
        public static bool Check(string ip)
        {
            
            if (ip == "::1") return true;

            return false;
        }
    }
}