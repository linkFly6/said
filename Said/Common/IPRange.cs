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
        private static uint[][] ips;
        /// <summary>
        /// IP段(交错数组)
        /// </summary>
        public static uint[][] IPs
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
        private static uint[][] Load()
        {
            if (IPs != null) return IPs;
            //172.0.0.1;192.168.1.1-192.168.1.2
            string[] ipStr = ConfigTable.Get(ConfigEnum.IPRange).Split(';');
            ips = new uint[ipStr.Length][];
            for (int i = 0; i < ipStr.Length; i++)
            {
                string[] temp = ipStr[i].Split('-');
                uint startIP = BitConverter.ToUInt32(IPAddress.Parse(temp[0]).GetAddressBytes(), 0),
                    endIP = 0;
                //这里还要判定127.0.*.*和127.0.*.*-127.22.*.*

                if (temp.Length > 1) endIP = BitConverter.ToUInt32(IPAddress.Parse(temp[1]).GetAddressBytes(), 0);
                //http://stackoverflow.com/questions/461742/how-to-convert-an-ipv4-address-into-a-integer-in-c
                if (endIP == 0)
                    ips[i] = new uint[1] { startIP };
                else
                    ips[i] = new uint[2] { startIP, endIP };
            }
            return ips;
        }

        //private static uint ip2Uint() { 

        //}


        /// <summary>
        /// 检测一个IP是否在配置允许的IP段内
        /// </summary>
        /// <param name="ip"></param>
        /// <returns></returns>
        public static bool Check(string ip)
        {

            if (ip == "::1" || ip == "127.0.0.1") return true;
            //TODO 这里会报很多错误，需要检查！
            uint numberIP = BitConverter.ToUInt32(IPAddress.Parse(ip).GetAddressBytes(), 0);
            foreach (uint[] item in IPs)
            {
                if (item.Length > 1 && item[0] <= numberIP && numberIP <= item[1])
                    return true;
                else if (item[0] == numberIP)
                    return true;
            }
            return false;
        }
    }
}