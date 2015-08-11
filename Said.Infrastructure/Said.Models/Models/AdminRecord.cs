using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// 管理员行为表
    /// </summary>
    public class AdminRecord : BaseModel
    {
        [Key]
        public string AdminRecordId { get; set; }

        /// <summary>
        /// 行为描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 操作类型枚举（操作行为重要级）
        /// </summary>
        public OperationType OperationType { get; set; }

        /// <summary>
        /// 回滚Sql
        /// </summary>
        public string Rollback { get; set; }

        /// <summary>
        /// 来源
        /// </summary>
        public string UrlReferrer { get; set; }


        /// <summary>
        /// 来源的主机名/IP+端口号
        /// </summary>
        public string ReferrerAuthority { get; set; }

        /// <summary>
        /// 用户访问的IP
        /// </summary>
        public string IP { get; set; }

        /// <summary>
        /// 访问地址
        /// </summary>
        public string Address { get; set; }


        /// <summary>
        /// 访问的UA
        /// </summary>
        public string UserAgent { get; set; }

        /// <summary>
        /// 获取访问的完整URL :Request.Url.ToString() => http://www.test.com/test/linkFly?id=5&name=kelli
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// 管理员ID
        /// </summary>
        public int AdminId { get; set; }

        /// <summary>
        /// 管理员对象
        /// </summary>
        public virtual Admin Admin { get; set; }

        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
