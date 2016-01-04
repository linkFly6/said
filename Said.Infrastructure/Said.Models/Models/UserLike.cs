using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models
{
    public class UserLike : BaseModel
    {
        public string UserLikeId { get; set; }

        /// <summary>
        /// Like的Blog/Said ID
        /// </summary>
        public string LikeArticleId { get; set; }

        /// <summary>
        /// Like类型：0：Said 、1:Blog
        /// </summary>
        public int LikeType { get; set; }

        /// <summary>
        /// 用户Id
        /// </summary>
        public string UserId { get; set; }

        public override IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> Validate()
        {
            throw new NotImplementedException();
        }
    }
}
