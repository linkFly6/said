using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Entity
{
    /// <summary>
    /// 领域实体基类
    /// </summary>
    internal class BaseEntity
    {

        /// <summary>
        /// 【移除】这个实体对象持久化的数据，仅仅修改标志
        /// </summary>
        /// <returns></returns>
        public static int RemoveData<T>() where T : BaseEntity
        {
            return -1;
        }

        /// <summary>
        /// 【永久】删除这个实体对象持久化的数据
        /// </summary>
        /// <returns></returns>
        public static int DeleteData<T>() where T : BaseEntity
        {
            return -1;
        }
    }
}
