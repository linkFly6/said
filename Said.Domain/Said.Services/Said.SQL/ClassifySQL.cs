using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services
{
    internal class ClassifySQL
    {
        #region Sql
        /// <summary>
        /// 修改分类名称
        /// </summary>
        public static readonly string SQL_UPDATENAME = "UPDATE [Classify] SET [CName] = @CNAME WHERE ClassifyId=@ClassifyId";
        /// <summary>
        /// 修改分类ICON
        /// </summary>
        public static readonly string SQL_UPDATEICON = "UPDATE [Classify] SET [CIcon] = @CICON WHERE ClassifyId=@ClassifyId";

        #endregion


        #region 查询字段
        /// <summary>
        /// 分类ID
        /// </summary>
        public static readonly string CLASSIFYID = "@CNAME";

        /// <summary>
        /// 类型包含的文章数量
        /// </summary>
        public static readonly string CCOUNT = "@CCOUNT";

        /// <summary>
        /// 类型icon
        /// </summary>
        public static readonly string CICON = "@CICON";
        /// <summary>
        /// 类型下最后一次更新的文章ID
        /// </summary>
        public static readonly string CLASTBLOGID = "@CLASTBLOGID";
        /// <summary>
        /// 类型下最后一次更新的文章名称
        /// </summary>
        public static readonly string CLASTBLOGNAME = "@CLASTBLOGNAME";
        /// <summary>
        /// 类型名称
        /// </summary>
        public static readonly string CNAME = "@CNAME";

        #endregion
    }
}
