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
        /// 用户名称
        /// </summary>
        public string Name { get; set; }


        public override IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
