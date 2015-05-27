using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    public class Address
    {
        public string IP { get; set; }
        /// <summary>
        /// 国家
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// 省份
        /// </summary>
        public string Province { get; set; }

        /// <summary>
        /// 城市
        /// </summary>
        public string City { get; set; }

        /// <summary>
        /// 区域
        /// </summary>
        public string District { get; set; }

        /// <summary>
        /// 运营商
        /// </summary>
        public string ISP { get; set; }
    }
}
