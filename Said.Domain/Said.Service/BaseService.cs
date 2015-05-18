using PagedList;
using Said.Common;
using Said.Domain.Said.Data;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Said.IServices
{
    public class BaseService<T> : IService<T> where T : BaseModel
    {
        /// <summary>
        /// 数据库上下文工厂
        /// </summary>
        protected DatabaseFactory Factory;
        /// <summary>
        /// 数据库实体上下文
        /// </summary>
        private SaidDbContext context;
        /// <summary>
        /// 相应实体存储单元
        /// </summary>
        private readonly IDbSet<T> dbset;
        /// <summary>
        /// 数据库连接
        /// </summary>
        public BaseService(DatabaseFactory factory)
        {
            this.Factory = factory;
            this.dbset = Context.Set<T>();
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
                //Type type = item.GetType();
                //这里怎么获取类型呢？
                item.SetValue(model, dr[item.Name], null);
            }
            return model;
        }
        #endregion

        protected SaidDbContext Context { get { return context ?? (context = Factory.Get()); } }

        #region linq通用

        #region 增删改
        /// <summary>
        /// 添加一个对象到存储单元
        /// </summary>
        /// <param name="model">实体对象</param>
        public virtual void Add(T model)
        {
            dbset.Add(model);
        }
        /// <summary>
        /// 修改一个对象到存储单元
        /// </summary>
        /// <param name="model">实体对象</param>
        public virtual void Update(T model)
        {
            dbset.Attach(model);
            context.Entry(model).State = EntityState.Modified;
        }

        /// <summary>
        /// 从存储单元中【真正】删除一个对象
        /// </summary>
        /// <param name="model">要删除的实体对象</param>
        public virtual void Delete(T model)
        {
            dbset.Remove(model);
        }
        /// <summary>
        /// 从存储单元中【真正】删除一组对象
        /// </summary>
        /// <param name="where">要删除的实体对象过滤表达式</param>
        public virtual void Delete(Expression<Func<T, bool>> where)
        {
            IEnumerable<T> models = dbset.Where(where).AsEnumerable();
            foreach (var model in models)
                dbset.Remove(model);
        }

        /// <summary>
        /// 从存储单元中【标志一个对象为删除状态】
        /// </summary>
        /// <param name="model">要标志删除的实体对象</param>
        public virtual void Del(T model)
        {
            model.IsDel = 1;
            Update(model);
        }
        /// <summary>
        /// 从存储单元中【标志一组对象为删除状态】
        /// </summary>
        /// <param name="where">查询表达式，结果为一组要删除标志的实体对象</param>
        public virtual void Del(Expression<Func<T, bool>> where)
        {
            IEnumerable<T> models = dbset.Where(where).AsEnumerable();
            foreach (var model in models)
                Del(model);
        }

        #endregion

        #region 查询
        /// <summary>
        /// 无条件查询全部
        /// </summary>
        /// <returns></returns>
        public virtual IEnumerable<T> GetAll()
        {
            return dbset.ToList();
        }

        /// <summary>
        /// 根据long ID查询一条
        /// </summary>
        /// <param name="id">类型为long的ID</param>
        /// <returns></returns>
        public virtual T GetById(long id)
        {
            return dbset.Find(id);
        }
        /// <summary>
        /// 根据ID查询一条
        /// </summary>
        /// <param name="id">类型为string的ID</param>
        /// <returns></returns>
        public virtual T GetById(string id)
        {
            return dbset.Find(id);
        }
        /// <summary>
        /// 根据条件查询
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        public virtual IEnumerable<T> GetMany(Expression<Func<T, bool>> where)
        {
            return dbset.Where(where).ToList();
        }
        /// <summary>
        /// 查询一条
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        public virtual T Get(Expression<Func<T, bool>> where)
        {
            return dbset.Where(where).FirstOrDefault();
        }
        /// <summary>
        /// 分页查询
        /// </summary>
        /// <typeparam name="TOrder">实体</typeparam>
        /// <param name="page">分页对象</param>
        /// <param name="where">分页表达式</param>
        /// <param name="order">排序表达式</param>
        /// <returns></returns>
        public virtual IPagedList<T> GetPage<TOrder>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order)
        {
            var results = dbset.OrderBy(order).Where(where).GetPage(page).ToList();
            var total = dbset.Count(where);
            return new StaticPagedList<T>(results, page.PageNumber, page.PageSize, total);
        }


        /// <summary>
        /// 分页查询，允许查询模型的一部分数据
        /// </summary>
        /// <typeparam name="TOrder">排序对象</typeparam>
        /// <typeparam name="TResult">linq to Sql要提取模型的一部分数据，所以需要提供一个匿名类作为linq to sql的过度</typeparam>
        /// <param name="page">分页对象</param>
        /// <param name="where">条件过滤</param>
        /// <param name="order">排序</param>
        /// <param name="selector">linq to Sql的匿名对象表达式</param>
        /// <param name="selectorToEntity">sql to Entity（匿名对象转实体）的表达式</param>
        /// <returns></returns>
        public virtual IPagedList<T> GetPage<TOrder, TResult>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order, Expression<Func<T, TResult>> selector, Func<TResult, T> selectorToEntity)
        {
            var results = dbset.OrderBy(order).Where(where).Select(selector).GetPage(page).ToList().Select(selectorToEntity);
            var total = dbset.Count(where);
            return new StaticPagedList<T>(results, page.PageNumber, page.PageSize, total);
        }



        /// <summary>
        /// 根据id检索数据是否存在
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool Exists(string id)
        {
            return dbset.Find(id) != null;
        }

        /// <summary>
        /// 根据id（long）检索数据是否存在
        /// </summary>
        /// <param name="id">长id</param>
        /// <returns></returns>
        public bool Exists(long id)
        {
            return dbset.Find(id) != null;
        }

        /// <summary>
        /// 根据条件检索数据是否存在
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        public bool Exists(Expression<Func<T, bool>> where)
        {
            return dbset.Count(where) > 0;
        }

        #endregion

        #endregion


        /// <summary>
        /// 提交并保存数据
        /// </summary>
        /// <returns></returns>
        public int Submit()
        {
            return this.Context.Commit();
        }

    }
}
