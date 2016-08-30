using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    /// <summary>
    /// Said用户表
    /// </summary>
    public class User : BaseModel
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserID { get; set; }
        /// <summary>
        /// 用户Email
        /// </summary>
        public string EMail { get; set; }

        /// <summary>
        /// 用户站点
        /// </summary>
        public string Site { get; set; }
        /// <summary>
        /// 用户名称
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 是否订阅回复信息
        /// </summary>
        public bool IsSubscribeComments { get; set; }

        /// <summary>
        /// 角色： 0 - 普通用户 1 - 管理员
        /// </summary>
        public int Rule { get; set; }

        /// <summary>
        /// 用户密匙（永远不会在前端显示的密匙，用于用户加密信息使用的）
        /// </summary>
        public string SecretKey { get; set; }

        public override IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
