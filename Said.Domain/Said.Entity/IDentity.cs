using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Entity
{
    public class IDentity
    {
        /// <summary>
        /// 【移除】这个实体对象持久化的数据，仅仅修改标志
        /// </summary>
        /// <returns></returns>
        public int RemoveData()
        {
            return -1;
        }
        
        /// <summary>
        /// 【永久】删除这个实体对象持久化的数据
        /// </summary>
        /// <returns></returns>
        public int DeleteData()
        {
            return -1;
        }

    }
}
