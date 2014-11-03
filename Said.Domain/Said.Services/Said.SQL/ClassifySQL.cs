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
        /// 修改分类名称，参数：@ClassifyId
        /// </summary>
        public static readonly string SQL_UPDATENAME = "UPDATE [Classify] SET [CName] = @CNAME WHERE ClassifyId=@ClassifyId";
        /// <summary>
        /// 修改分类ICON，参数：@ClassifyId
        /// </summary>
        public static readonly string SQL_UPDATEICON = "UPDATE [Classify] SET [CIcon] = @CICON WHERE ClassifyId=@ClassifyId";

        /// <summary>
        /// 查询全部，参数：无
        /// </summary>
        public static readonly string SQL_ALL = "SELECT [ClassifyId],[CCount],[CIcon],[CLastBlogId],[CLastBlogName],[CName],[IsDel] FROM [Classify]";

        /// <summary>
        /// 根据ID查询一条，参数：@ClassifyId
        /// </summary>
        public static readonly string SQL_ONEBYID = "SELECT [ClassifyId],[CCount],[CIcon],[CLastBlogId],[CLastBlogName],[CName],[IsDel] FROM [SaidDB].[Classify] WHERE [ClassifyId]=@ClassifyId";

        /// <summary>
        /// 根据分类名称查询全部，参数：@CLastBlogName
        /// </summary>
        public static readonly string SQL_FINDBYNAMES = "SELECT [ClassifyId],[CCount],[CIcon],[CLastBlogId],[CLastBlogName],[CName],[IsDel] FROM [SaidDB].[dbo].[Classify] WHERE [CLastBlogName]  LIKE '%'+@CLastBlogName+'%'";

        /// <summary>
        /// 根据分类名称查询一条，参数：@CLastBlogName
        /// </summary>
        public static readonly string SQL_FINDBYNAME = "SELECT TOP 1 [ClassifyId],[CCount],[CIcon],[CLastBlogId],[CLastBlogName],[CName],[IsDel] FROM [SaidDB].[dbo].[Classify] WHERE [CLastBlogName]  LIKE '%'+@CLastBlogName+'%'";
        #endregion


        #region 查询字段
        /// <summary>
        /// 分类ID
        /// </summary>
        public static readonly string FIELD_CLASSIFYID = "@CNAME";

        /// <summary>
        /// 类型包含的文章数量
        /// </summary>
        public static readonly string FIELD_CCOUNT = "@CCOUNT";

        /// <summary>
        /// 类型icon
        /// </summary>
        public static readonly string FIELD_CICON = "@CICON";
        /// <summary>
        /// 类型下最后一次更新的文章ID
        /// </summary>
        public static readonly string FIELD_CLASTBLOGID = "@CLASTBLOGID";
        /// <summary>
        /// 类型下最后一次更新的文章名称
        /// </summary>
        public static readonly string FIELD_CLASTBLOGNAME = "@CLASTBLOGNAME";
        /// <summary>
        /// 类型名称
        /// </summary>
        public static readonly string FIELD_CNAME = "@CNAME";

        #endregion
    }
}
