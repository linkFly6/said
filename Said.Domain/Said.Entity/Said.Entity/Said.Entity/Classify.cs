using Said.Dal;
using Said.Dal.DataServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Entity
{
    /// <summary>
    /// 领域实体 - 文章（blog）类型
    /// </summary>
    public class Classify : BaseEntity
    {
        #region 方法
        /// <summary>
        /// 修改类别名称
        /// </summary>
        /// <param name="ClassifyId">类别id</param>
        /// <param name="name">类别名称</param>
        /// <returns></returns>
        public static int UpdateName(int classifyId, string name)
        {
            return ClassifyService.UpdateName(classifyId, name);
        }

        /// <summary>
        /// 修改类别Icon
        /// </summary>
        /// <param name="classifyId">类别id</param>
        /// <param name="icon">类别Icon</param>
        /// <returns></returns>
        public static int UpdateIcon(int classifyId, string icon)
        {
            return ClassifyService.UpdateIcon(classifyId, icon);
        }

        #endregion
    }
}