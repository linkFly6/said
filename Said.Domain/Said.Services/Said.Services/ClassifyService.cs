using Said.Dal;
using Said.Domain.Said.Services.Said.IServices;
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
    public class ClassifyService : BaseService<Classify>, IClassifyService<Classify>
    {
        private IDBHelper Helper;

        public ClassifyService(IDBHelper helper)
        {
            this.Helper = helper;
        }

        #region 修改分类名称
        /// <summary>
        /// 修改分类名称
        /// </summary>
        /// <param name="classifyId">要修改的类型ID</param>
        /// <param name="name">类别名称</param>
        /// <returns></returns>
        public int UpdateName(int classifyId, string name)
        {
            return Helper.ExecuteNonQuery(CommandType.Text, ClassifySQL.SQL_UPDATENAME, new SqlParameter(ClassifySQL.CLASSIFYID, classifyId), new SqlParameter(ClassifySQL.CNAME, name));
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
            return Helper.ExecuteNonQuery(CommandType.Text, ClassifySQL.SQL_UPDATEICON, new SqlParameter(ClassifySQL.CLASSIFYID, classifyId), new SqlParameter(ClassifySQL.CICON, icon));
        }
        #endregion



    }
}
