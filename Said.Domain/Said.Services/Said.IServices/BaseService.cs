using Said.Dal;
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
        protected IDBHelper Helper;
        public BaseService(IDBHelper helper)
        {
            this.Helper = helper;
        }

        #region 通用查询
        /// <summary>
        /// 查询多个通用方法
        /// </summary>
        /// <param name="cmdType">执行的Sql类型</param>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal IList<T> Find(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            IList<T> list = new List<T>();
            using (SqlDataReader dr = this.Helper.ExecuteReader(cmdType, sql, sp))
            {
                if (dr.HasRows)
                    while (dr.Read())
                        list.Add(Read(dr));
            }
            return list;
        }

        /// <summary>
        /// 查询单个通用方法
        /// </summary>
        /// <param name="cmdType">执行的Sql类型</param>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal T One(CommandType cmdType, string sql, params SqlParameter[] sp)
        {
            T model = null;
            using (SqlDataReader dr = this.Helper.ExecuteReader(cmdType, sql, sp))
            {
                while (dr.HasRows && dr.Read())
                    model = Read(dr);
            }
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
            return Find(CommandType.Text, sql, sp);
        }

        /// <summary>
        /// 使用Sql语句查询单个通用方法
        /// </summary>
        /// <param name="sql">Sql语句</param>
        /// <param name="sp">参数</param>
        /// <returns></returns>
        internal T One(string sql, params SqlParameter[] sp)
        {
            return One(CommandType.Text, sql, sp);
        } 
        #endregion

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
    }
}
