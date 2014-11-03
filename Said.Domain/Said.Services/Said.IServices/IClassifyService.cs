using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services.Said.IServices
{
    /// <summary>
    /// 【分类】数据库服务接口
    /// </summary>
    interface IClassifyService<T>
    {
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
    }
}
