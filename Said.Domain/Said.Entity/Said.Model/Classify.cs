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
    /// 文章（blog）类型
    /// </summary>
    public class Classify : IDentity
    {
        #region 属性
        /// <summary>
        /// 主键
        /// </summary>
        public int ClassifyId { get; set; }
        /// <summary>
        /// 类型包含的文章数量
        /// </summary>
        public int CCount { get; set; }
        /// <summary>
        /// 类型icon
        /// </summary>
        public string CIcon { get; set; }
        /// <summary>
        /// 类型下最后一次更新的文章ID
        /// </summary>
        public string CLastBlogId { get; set; }
        /// <summary>
        /// 类型下最后一次更新的文章名称
        /// </summary>
        public string CLastBlogName { get; set; }
        /// <summary>
        /// 类型名称
        /// </summary>
        public string CName { get; set; }
        /// <summary>
        /// 是否已删除（0：否  1：是 ）
        /// </summary>
        public int IsDel { get; set; }
        #endregion

        #region 方法
        /// <summary>
        /// 修改类别名称
        /// </summary>
        /// <returns></returns>
        public int UpdateName()
        {
            return ClassifyService.UpdateName(this.ClassifyId);
        }

        /// <summary>
        /// 修改类别Icon
        /// </summary>
        /// <returns></returns>
        public int UpdateIcon()
        {
            return ClassifyService.UpdateIcon(this.ClassifyId);
        }

        #endregion
    }
}
