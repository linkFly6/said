using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 用户记录表（从这里记录PV）
    /// </summary>
    public class UserRecord : BaseModel
    {
        /// <summary>
        /// 用户记录
        /// </summary>
        [Key, DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)]
        public int UserRecordID { get; set; }


        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserID { get; set; }

        /// <summary>
        /// 该记录隶属的用户
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// Session ID
        /// </summary>
        public string SessionID { get; set; }

        /// <summary>
        /// 访问时间
        /// </summary>
        public DateTime AccessDate { get; set; }



        ///// <summary>
        ///// 用户回话ID，这里记录隶属的用户回话
        ///// </summary>
        //public string UserSessionID { get; set; }

        ///// <summary>
        ///// 用户回话对象
        ///// </summary>
        //public virtual UserSession UserSession { get; set; }

        /// <summary>
        /// 来源
        /// </summary>
        public string UrlReferrer { get; set; }


        /// <summary>
        /// 来源的主机名/IP+端口号
        /// </summary>
        public string ReferrerAuthority { get; set; }

        /// <summary>
        /// 当前访问的Url本地路径
        /// </summary>
        public string LocalPath { get; set; }


        /// <summary>
        /// url参数：?test=linkFly
        /// </summary>
        public string Query { get; set; }


        /// <summary>
        /// 访问的操作系统
        /// </summary>
        public string OS { get; set; }

        /// <summary>
        /// 访问的浏览器
        /// </summary>
        public string Browser { get; set; }

        /// <summary>
        /// 访问的UA
        /// </summary>
        public string UserAgent { get; set; }


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

        ///// <summary>
        ///// 区域
        ///// </summary>
        //public string District { get; set; }

        ///// <summary>
        ///// 运营商
        ///// </summary>
        //public string ISP { get; set; }

        /// <summary>
        /// 用户访问的IP
        /// </summary>
        public string IP { get; set; }

        /// <summary>
        /// 搜索引擎爬虫名称，如果不是搜索引擎，则为空
        /// </summary>
        public string SpiderName { get; set; }



        /// <summary>
        /// 客户端语言
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// 统计的key（例如从页面的某个点击过来的）
        /// </summary>
        public string Key { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
