using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace Said.Data
{
    public class ConfigTable : Dictionary<string, string>
    {
        private static ConfigTable configTable;
        private ConfigTable(string jsonString)
        {
            JavaScriptSerializer jss = new JavaScriptSerializer();
            Dictionary<string, string> model = jss.Deserialize<ConfigTable>(jsonString);
            foreach (string key in model.Keys)
            {
                this.Add(key, model[key]);
            }
        }
        public static ConfigTable Get(string jsonString)
        {
            return configTable ?? (configTable = new ConfigTable(jsonString));
        }
    }
}
