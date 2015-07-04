using PagedList;
using Said.Models;
using Said.Models.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Said.IServices
{
    public interface IService<T> where T : BaseModel
    {
        #region 增删改
        /// <summary>
        /// 添加一个对象到存储单元
        /// </summary>
        /// <param name="model">实体对象</param>
        void Add(T model);

        /// <summary>
        /// 修改一个对象到存储单元
        /// </summary>
        /// <param name="model">实体对象</param>
        void Update(T model);

        /// <summary>
        /// 从存储单元中【真正】删除一个对象
        /// </summary>
        /// <param name="model">要删除的实体对象</param>
        void Delete(T model);
        /// <summary>
        /// 从存储单元中【真正】删除一组对象
        /// </summary>
        /// <param name="where">要删除的实体对象过滤表达式</param>
        void Delete(Expression<Func<T, bool>> where);

        /// <summary>
        /// 从存储单元中【标志一个对象为删除状态】
        /// </summary>
        /// <param name="model">要标志删除的实体对象</param>
        void Del(T model);

        /// <summary>
        /// 从存储单元中【标志一组对象为删除状态】
        /// </summary>
        /// <param name="where">查询表达式，结果为一组要删除标志的实体对象</param>
        void Del(Expression<Func<T, bool>> where);


        #endregion

        #region 查询
        /// <summary>
        /// 无条件查询全部
        /// </summary>
        /// <returns></returns>
        IEnumerable<T> GetAll();


        /// <summary>
        /// 根据long ID查询一条
        /// </summary>
        /// <param name="id">类型为long的ID</param>
        /// <returns></returns>
        T GetById(long id);

        /// <summary>
        /// 根据ID查询一条
        /// </summary>
        /// <param name="id">类型为string的ID</param>
        /// <returns></returns>
        T GetById(string id);

        /// <summary>
        /// 根据id检索数据是否存在
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        bool Exists(string id);

        /// <summary>
        /// 根据id（long）检索数据是否存在
        /// </summary>
        /// <param name="id">长id</param>
        /// <returns></returns>
        bool Exists(long id);

        /// <summary>
        /// 根据条件检索数据是否存在
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        bool Exists(Expression<Func<T, bool>> where);

        /// <summary>
        /// 根据条件查询
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        IEnumerable<T> GetMany(Expression<Func<T, bool>> where);

        /// <summary>
        /// 查询一条
        /// </summary>
        /// <param name="where">条件表达式</param>
        /// <returns></returns>
        T Get(Expression<Func<T, bool>> where);

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <typeparam name="TOrder">实体</typeparam>
        /// <param name="page">分页对象</param>
        /// <param name="where">分页表达式</param>
        /// <param name="order">排序表达式</param>
        /// <returns></returns>
        IPagedList<T> GetPage<TOrder>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order);


        /// <summary>
        /// 分页查询（按照排序表达式倒序排列）
        /// </summary>
        /// <typeparam name="TOrder">实体</typeparam>
        /// <param name="page">分页对象</param>
        /// <param name="where">分页表达式</param>
        /// <param name="order">排序表达式（按照排序表达式倒序排列）</param>
        /// <returns></returns>
        IPagedList<T> GetPageDesc<TOrder>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order);



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
        IPagedList<T> GetPage<TOrder, TResult>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order, Expression<Func<T, TResult>> selector, Func<TResult, T> selectorToEntity);


        /// <summary>
        /// 分页查询，允许查询模型的一部分数据（按照排序表达式倒序排列）
        /// </summary>
        /// <typeparam name="TOrder">排序对象</typeparam>
        /// <typeparam name="TResult">linq to Sql要提取模型的一部分数据，所以需要提供一个匿名类作为linq to sql的过度</typeparam>
        /// <param name="page">分页对象</param>
        /// <param name="where">条件过滤</param>
        /// <param name="order">排序（按照排序表达式倒序排列）</param>
        /// <param name="selector">linq to Sql的匿名对象表达式</param>
        /// <param name="selectorToEntity">sql to Entity（匿名对象转实体）的表达式</param>
        /// <returns></returns>
        IPagedList<T> GetPageDesc<TOrder, TResult>(Page page, Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order, Expression<Func<T, TResult>> selector, Func<TResult, T> selectorToEntity);
        #endregion

        #region 提交
        int Submit();
        #endregion
    }
}
