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
    /// 用户访问一次记录表（从这里记录UV）
    /// </summary>
    public class UserSession
    {

        /// <summary>
        /// ID
        /// </summary>
        [Key, DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)]
        public int UserSessionID { get; set; }
        /*
         *      主键自增列，字段名为Id或者TableName+Id就自动识别为主键，如果是int类型，就为自增
         *      如果自己想要设置主键，则添加[Key, DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)]
         */

        /// <summary>
        /// 开始访问时间
        /// </summary>
        public DateTime FirstDate { get; set; }
        /// <summary>
        /// 最后一次访问时间
        /// </summary>
        public DateTime LastDate { get; set; }

        /// <summary>
        /// 访问IP
        /// </summary>
        public string IP { get; set; }

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserID { get; set; }

        /// <summary>
        /// 该记录隶属的用户
        /// </summary>
        public virtual User User { get; set; }

    }
}
