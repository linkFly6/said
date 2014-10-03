using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.DataHelper.DBHelper
{
    /// <summary>
    /// 本对象提供一组方法，这些方法用于将一个对象映射出对应的Sql语句
    /// </summary>
    public abstract class IWhereHelper
    {
        protected IWhereHelper()
        {
        }

        #region  Insert插入
        /// <summary>
        /// Insert插入 
        /// </summary>
        /// <typeparam name="T">Model类型</typeparam>
        /// <param name="model">Model实例</param>
        /// <returns>返回拼接完成后的Sql语句</returns>
        public static string ToInsert<T>(T model) where T : new()
        {
            StringBuilder sqlStr = new StringBuilder("INSERT INTO ");
            StringBuilder sqlWhere = new StringBuilder();
            sqlStr.AppendFormat("(", model.ToString());
            Dictionary<string, object> dir = ModelHelper.GetModelProperties<T>(model);
            foreach (string key in dir.Keys)
            {
                sqlStr.Append(key);
                sqlWhere.AppendFormat("'{0}',", dir[key]);
            }
            sqlStr.AppendFormat(") VALUES(");
            sqlStr.Append(sqlWhere.Remove(sqlWhere.Length - 1, 1));
            sqlStr.AppendFormat(")");
            return sqlStr.ToString();
        }
        #endregion


        //反射性能低下，反射失败....囧

        #region  Update修改
        /// <summary>
        /// update修改
        /// </summary>
        /// <typeparam name="T">Model类型</typeparam>
        /// <param name="model">Model实例</param>
        /// <returns>返回拼接完成后的Sql语句</returns>
        public static string ToUpdate<T>(T model) where T : new()
        {
            StringBuilder sqlStr = new StringBuilder("INSERT INTO ");
            StringBuilder sqlWhere = new StringBuilder();
            sqlStr.AppendFormat("(", model.ToString());
            Dictionary<string, object> dir = ModelHelper.GetModelProperties<T>(model);
            foreach (string key in dir.Keys)
            {
                sqlStr.Append(key);
                sqlWhere.AppendFormat("'{0}',", dir[key]);
            }
            sqlStr.AppendFormat(") VALUES(");
            sqlStr.Append(sqlWhere.Remove(sqlWhere.Length - 1, 1));
            sqlStr.AppendFormat(")");
            return sqlStr.ToString();
        }
        #endregion


    }
}
