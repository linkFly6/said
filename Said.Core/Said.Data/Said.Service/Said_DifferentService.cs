using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Said.Dal;
using Said.IDal;
using Said.Models;

namespace Said.Service
{
    public static class Said_DifferentService
    {
        #region 基础公共部分
        private const string DATA = "SELECT * FROM Said_Different WHERE Different_Id=@Different_Id AND IsState=0";
        private const string DATAS = "SELECT * FROM Said_Different WHERE Different_Title LIKE '%'+@Different_Title+'%' AND IsState = 0";
        private static IDBHelper Server = DataFactory.Get(DBType.SqlServer);
        #endregion


        #region 基础接口
        #region 根据id查询单条结果
        /// <summary>
        /// 根据id查询单条结果
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Said_Different Data(string id)
        {
            SqlParameter[] sp = { new SqlParameter("@Different_Id", id) };
            return Read(CommandType.Text, DATA, sp);
        }
        #endregion

        #region 根据Different_Title检索多条数据
        /// <summary>
        /// 根据id查询单条结果
        /// </summary>
        /// <param name="different_Title">文章Title</param>
        /// <returns></returns>
        public static List<Said_Different> Datas(string different_Title)
        {
            SqlParameter[] sp = { new SqlParameter("@Different_Title", different_Title) };
            return Reads(CommandType.Text, DATAS, sp);
        }
        #endregion

        #region 分页检索数据

        #endregion


        #endregion

        #region 公共部分
        /// <summary>
        /// 查询多条
        /// </summary>
        /// <param name="cmdType"></param>
        /// <param name="sql"></param>
        /// <param name="sp"></param>
        /// <returns></returns>
        public static List<Said_Different> Reads(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            List<Said_Different> list = null;
            using (SqlDataReader dr = Server.ExecuteReader(cmdType, sql, sp))
            {
                if (dr.HasRows)
                {
                    list = new List<Said_Different>();
                    while (dr.Read())
                        list.Add(ReadEnity(dr));
                }
            }
            return list;
        }


        /// <summary>
        /// 查询单条
        /// </summary>
        /// <param name="cmdType"></param>
        /// <param name="sql"></param>
        /// <param name="sp"></param>
        /// <returns></returns>
        public static Said_Different Read(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            Said_Different diff = null;
            using (SqlDataReader dr = Server.ExecuteReader(cmdType, sql, sp))
            {
                if (dr.Read())
                    diff = ReadEnity(dr);
            }
            return diff;
        }


        #region 共用底层读取实体方法
        /// <summary>
        /// 共用底层读取实体方法
        /// </summary>
        /// <param name="dr">数据库连接对象</param>
        /// <returns></returns>
        public static Said_Different ReadEnity(SqlDataReader dr)
        {
            Said_Different different = new Said_Different();
            different.Different_Id = dr["Different_Id"].ToString();
            different.Different_Date = Convert.ToDateTime(dr["Different_Id"]);
            different.Different_Title = dr["Different_Id"].ToString();
            different.Different_Context = dr["Different_Id"].ToString();
            different.Different_Img = dr["Different_Id"].ToString();
            different.Different_Name = dr["Different_Id"].ToString();
            different.Different_Status = Convert.ToInt32(dr["Different_Id"]);
            different.Different_Music = dr["Different_Id"].ToString();
            different.Different_XML = dr["Different_Id"].ToString();
            different.Different_Tag = dr["Different_Id"].ToString();
            different.Different_ShareCount = Convert.ToInt32(dr["Different_Id"]);
            different.Different_LoadCount = Convert.ToInt32(dr["Different_Id"]);
            different.Different_LikeCount = Convert.ToInt32(dr["Different_Id"]);
            different.Different_StarCount = Convert.ToInt32(dr["Different_Id"]);
            different.IsState = Convert.ToInt32(dr["Different_Id"]);
            return different;
        }
        #endregion


        /// <summary>
        /// 提供更开放的接口，自由查询
        /// </summary>
        /// <returns></returns>
        private static string Builde()
        {
            return string.Empty;
        }
        #endregion

    }
}
