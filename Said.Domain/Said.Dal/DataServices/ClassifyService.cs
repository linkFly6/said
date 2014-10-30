using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace Said.Dal.DataServices
{
    /// <summary>
    /// 分类数据库持久化服务
    /// </summary>
    public static class ClassifyService
    {
        private static IDBHelper Helper = DataFactory.Get();
        /// <summary>
        /// 修改分类名称
        /// </summary>
        private static readonly string UPDATENAME = "UPDATE [Classify] SET [CName] = @CNAME WHERE ClassifyId=@ClassifyId";
        /// <summary>
        /// 修改分类ICON
        /// </summary>
        private static readonly string UPDATEICON = "UPDATE [Classify] SET [CIcon] = @CNAME WHERE ClassifyId=@ClassifyId";

        /// <summary>
        /// 修改分类名称
        /// </summary>
        /// <param name="ClassifyId">要修改的类型ID</param>
        /// <returns></returns>
        public static int UpdateName(int ClassifyId)
        {
            return Helper.ExecuteNonQuery(CommandType.Text, UPDATENAME, new SqlParameter("@ClassifyId", ClassifyId));
        }

        /// <summary>
        /// 修改分类Icon
        /// </summary>
        /// <param name="ClassifyId">要修改的类型ID</param>
        /// <returns></returns>
        public static int UpdateIcon(int ClassifyId)
        {
            return Helper.ExecuteNonQuery(CommandType.Text, UPDATEICON, new SqlParameter("@ClassifyId", ClassifyId));
        }
    }
}
