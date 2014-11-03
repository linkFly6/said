using Said.Dal;
using Said.Domain.Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services
{
    /// <summary>
    /// 分类服务类
    /// </summary>
    public sealed class ClassifyService : BaseService<Classify>, IClassifyService<Classify>
    {
        public ClassifyService(IDBHelper helper)
            : base(helper)
        {

        }

        #region 修改
        #region 修改分类名称
        /// <summary>
        /// 修改分类名称
        /// </summary>
        /// <param name="classifyId">要修改的类型ID</param>
        /// <param name="name">类别名称</param>
        /// <returns></returns>
        public int UpdateName(int classifyId, string name)
        {
            return Helper.ExecuteNonQuery(CommandType.Text, ClassifySQL.SQL_UPDATENAME, new SqlParameter(ClassifySQL.FIELD_CLASSIFYID, classifyId), new SqlParameter(ClassifySQL.FIELD_CNAME, name));
        }
        #endregion

        #region 修改分类Icon
        /// <summary>
        /// 修改分类Icon
        /// </summary>
        /// <param name="classifyId">要修改的类型ID</param>
        /// <param name="icon">类别icon</param>
        /// <returns></returns>
        public int UpdateIcon(int classifyId, string icon)
        {
            return Helper.ExecuteNonQuery(CommandType.Text, ClassifySQL.SQL_UPDATEICON, new SqlParameter(ClassifySQL.FIELD_CLASSIFYID, classifyId), new SqlParameter(ClassifySQL.FIELD_CICON, icon));
        }
        #endregion
        #endregion


        #region 查询
        /// <summary>
        /// 将SqlDataReader读取到对象模型中
        /// </summary>
        /// <param name="dr">安全的SqlDataReader</param>
        /// <returns>返回读取到的对象模型</returns>
        internal override Classify Read(SqlDataReader dr)
        {
            return new Classify
            {
                CCount = (int)dr["CCount"],
                CIcon = Convert.ToString(dr["CIcon"]),
                ClassifyId = (int)dr["ClassifyId"],
                CLastBlogId = Convert.ToString(dr["CLastBlogId"]),
                CLastBlogName = Convert.ToString(dr["CLastBlogName"]),
                CName = Convert.ToString(dr["CName"]),
                IsDel = (int)dr["IsDel"]
            };
        }

        /// <summary>
        /// 查询全部
        /// </summary>
        /// <returns></returns>
        public IList<Classify> All()
        {
            return base.Find(ClassifySQL.SQL_ALL);
        }

        /// <summary>
        /// 根据id查询单条
        /// </summary>
        /// <param name="classifyId"></param>
        /// <returns></returns>
        public Classify One(string classifyId)
        {
            return base.One(ClassifySQL.SQL_ONEBYID, new SqlParameter(ClassifySQL.FIELD_CLASSIFYID, classifyId));
        }

        /// <summary>
        /// 根据名称查询多条
        /// </summary>
        /// <param name="classifyName"></param>
        /// <returns></returns>
        public IList<Classify> FindByNames(string classifyName)
        {
            return base.Find(ClassifySQL.SQL_FINDBYNAMES, new SqlParameter(ClassifySQL.FIELD_CLASTBLOGNAME, classifyName));
        }

        /// <summary>
        /// 根据名称查询单条
        /// </summary>
        /// <param name="classifyName"></param>
        /// <returns></returns>
        public Classify FindByName(string classifyName)
        {
            return base.One(ClassifySQL.SQL_FINDBYNAME, new SqlParameter(ClassifySQL.FIELD_CLASTBLOGNAME, classifyName));
        }
        #endregion

    }
}
