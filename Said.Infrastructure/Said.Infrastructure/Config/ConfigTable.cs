using Said.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace Said.Config
{
    /// <summary>
    /// Said配置文件类
    /// </summary>
    public class ConfigTable
    {

        /// <summary>
        /// 静态的，唯一实例化的ConfigTable对象
        /// </summary>
        public static ConfigTable Table;

        #region 构建隐藏的单例模式
        private Dictionary<string, string> config;

        /// <summary>
        /// 公开的只读API
        /// </summary>
        public Dictionary<string, string> Config
        {
            get { return config; }
        }
        private ConfigTable(Dictionary<string, string> config)
        {
            this.config = config;
        }
        #endregion

        #region 静态访问接口
        /// <summary>
        /// 获取一个单例且唯一的ConfiTable对象
        /// </summary>
        /// <param name="path">读取的配置文件路径</param>
        /// <returns></returns>
        public static ConfigTable LoadConfig(string path)
        {
            if (Table != null)
                return Table;
            string jsonString = FileCommon.ReadToString(path);
            JavaScriptSerializer jss = new JavaScriptSerializer();
            var config = jss.Deserialize<Dictionary<string, string>>(jsonString);
            if (config == null)
                config = new Dictionary<string, string>();
            return Table = new ConfigTable(config);
        }


        /// <summary>
        /// 获取单例的ConfigTable对象
        /// </summary>
        /// <returns></returns>
        public static ConfigTable LoadConfig()
        {
            return Table;
        }
        #endregion

        #region 获取配置API
        ///// <summary>
        ///// 获取从ConfigEnum中得到的配置值
        ///// </summary>
        ///// <param name="name">参阅ConfigEnum中的属性</param>
        ///// <returns>返回相应配置的属性值</returns>
        //public string Get(string name)
        //{
        //    return config[name];
        //}

        /// <summary>
        /// 获取从ConfigEnum中得到的配置值
        /// </summary>
        /// <param name="name">参阅ConfigEnum中的属性</param>
        /// <returns>返回相应配置的属性值</returns>
        public static string Get(string name)
        {
            return Table[name];
        }



        /// <summary>
        /// 获取从ConfigEnum中得到的配置值
        /// </summary>
        /// <param name="name">参阅ConfigEnum中的属性</param>
        /// <returns>返回相应配置的属性值</returns>
        public string this[string name]
        {
            get
            {
                return config[name];
            }
        }
        #endregion

    }
}
