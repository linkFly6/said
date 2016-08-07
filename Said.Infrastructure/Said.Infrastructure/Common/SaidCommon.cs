using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    public class SaidCommon
    {
        /// <summary>
        /// 创建一个对象ID（新增对象的时候）
        /// </summary>
        /// <returns></returns>
        public static string CreateId()
        {
            return Guid.NewGuid().ToString().Replace("-", "");
        }
    }
}
