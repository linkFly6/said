using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    /// <summary>
    /// 配置文件类
    /// </summary>
    public class ConfigCommon
    {
        private static ConfigCommon config;
        private string path;
        private Hashtable Hash = new Hashtable();
        private ConfigCommon(string path)
        {

            this.path = path;
        }
        public static ConfigCommon Get(string path = "/config.xml")
        {
            return config ?? (config = new ConfigCommon(path));
        }

        public string Val(string key)
        {

            return string.Empty;
        }

        public ConfigCommon Val(string key, string value)
        {
            return this;
        }

        public ConfigCommon Val(Hashtable hash)
        {
            if (hash == null)
                return this;
            foreach (string key in hash.Keys)
            {
                this.Hash[key] = hash[key];
            }
            return this;
        }
    }
}
