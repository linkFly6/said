using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.IServices
{
    /// <summary>
    /// 【分类】数据库服务接口
    /// </summary>
    interface IClassifyService<T>
    {
        #region 增加
        #endregion

        #region 删除
        #endregion

        #region 查询
        /// <summary>
        /// 查询全部
        /// </summary>
        /// <returns></returns>
        IList<T> All();


        /// <summary>
        /// 根据ID查询一个
        /// </summary>
        /// <param name="classifyId"></param>
        /// <returns></returns>
        T One(string classifyId);

        /// <summary>
        /// 根据类别名称查询多个（支持模糊查询）
        /// </summary>
        /// <param name="classifyName">类别名称</param>
        /// <returns></returns>
        IList<T> FindByNames(string classifyName);

        /// <summary>
        /// 根据类别名称查询单个（支持模糊查询）
        /// </summary>
        /// <param name="classifyName">类别名称</param>
        /// <returns></returns>
        T FindByName(string classifyName);


        #endregion

        #region 修改
        /// <summary>
        /// 修改分类名称
        /// </summary>
        /// <param name="classifyId">要修改的类型ID</param>
        /// <param name="name">类别名称</param>
        /// <returns></returns>
        int UpdateName(int classifyId, string name);
        /// <summary>
        /// 修改分类Icon
        /// </summary>
        /// <param name="classifyId">要修改的类型ID</param>
        /// <param name="icon">类别icon</param>
        /// <returns></returns>
        int UpdateIcon(int classifyId, string icon);
        #endregion
    }
}
