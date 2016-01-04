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
    /// 管理员表
    /// </summary>
    public class Admin : BaseModel
    {
        [Key]//DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)
        public string AdminId { get; set; }

        /// <summary>
        /// 管理员用户名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 管理员用户密码
        /// </summary>
        public string Password { get; set; }



        public override IEnumerable<ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
