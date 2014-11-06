using Said.Domain.Said.Data;
using Said.Domain.Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    #region interface
    /// <summary>
    /// 分类服务接口
    /// </summary>
    public interface IClassifyService
    {
        /// <summary>
        /// 根据名称查询得到结果集（支持模糊查询）
        /// </summary>
        /// <param name="name">分类名称</param>
        /// <returns></returns>
        IEnumerable<Classify> GetsByName(string name);
        /// <summary>
        /// 根据名称查询结果（支持模糊查询）
        /// </summary>
        /// <param name="name">分类</param>
        /// <returns></returns>
        Classify GetByName(string name);
    }
    #endregion

    #region ClassifyService
    /// <summary>
    /// 分类服务
    /// </summary>
    public class ClassifyService : BaseService<Classify>, IClassifyService
    {

        public ClassifyService(DatabaseFactory factory)
            : base(factory)
        {

        }

        /// <summary>
        /// 根据名称查询得到结果集（支持模糊查询）
        /// </summary>
        /// <param name="name">分类名称</param>
        /// <returns></returns>
        public IEnumerable<Classify> GetsByName(string name)
        {
            return base.GetMany(n => n.CName.Contains(name));
        }
        /// <summary>
        /// 根据名称查询结果（支持模糊查询）
        /// </summary>
        /// <param name="name">分类</param>
        /// <returns></returns>
        public Classify GetByName(string name)
        {
            return base.Get(n => n.CName.Contains(name));
        }
    }
    #endregion
}
