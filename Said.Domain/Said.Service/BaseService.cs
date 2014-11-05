using Said.Common;
using Said.Domain.Said.Data;
using Said.Infrastructure.Said.Common;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.IServices
{
    public class BaseService<T> where T : BaseModel
    {
        /// <summary>
        /// 数据库连接
        /// </summary>
        protected SaidDbContext context;
        public BaseService(SaidDbContext context)
        {
            this.context = context;
        }

        #region Sql通用查询
        /// <summary>
        /// 查询多个通用方法
        /// </summary>
        /// <param name="cmdType">执行的Sql类型</param>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal IList<T> GetBySql(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            IList<T> list = new List<T>();
            //using (SqlDataReader dr = this.Helper.ExecuteReader(cmdType, sql, sp))
            //{
            //    if (dr.HasRows)
            //        while (dr.Read())
            //            list.Add(Read(dr));
            //}
            return list;
        }

        /// <summary>
        /// 查询单个通用方法
        /// </summary>
        /// <param name="cmdType">执行的Sql类型</param>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal T OneBySql(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            T model = null;
            //using (SqlDataReader dr = this.Helper.ExecuteReader(cmdType, sql, sp))
            //{
            //    while (dr.HasRows && dr.Read())
            //        model = Read(dr);
            //}
            return model;
        }


        /// <summary>
        /// 使用Sql语句查询多个通用方法
        /// </summary>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal IList<T> Find(string sql, params SqlParameter[] sp)
        {
            return GetBySql(CommandType.Text, sql, sp);
        }

        /// <summary>
        /// 使用Sql语句查询单个通用方法
        /// </summary>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal T One(string sql, params SqlParameter[] sp)
        {
            return OneBySql(CommandType.Text, sql, sp);
        }


        /// <summary>
        /// 虚方法，该方法（通过反射）将SqlDataReader转换为指定的对象模型，如果需要自定义，请重写该方法
        /// </summary>
        /// <param name="dr">保证有效的SqlDataReader</param>
        /// <returns>返回具体的模型</returns>
        internal virtual T Read(SqlDataReader dr)
        {
            return ReadModel(dr);
        }

        private T ReadModel(SqlDataReader dr)
        {
            T model = Activator.CreateInstance<T>();
            PropertyInfo[] props = ModelCommon.GetPropertyInfoArray<T>();
            foreach (var item in props)
            {
                Type type = item.GetType();
                //这里怎么获取类型呢？
                item.SetValue(model, dr[item.Name], null);
            }
            return model;
        }
        #endregion

        #region linQ通用
        public T One(int id)
        { 
            return this.context.Set<T>
        }
        #endregion
    }
}
