using PagedList;
using Said.IServices;
using Said.Models;
using Said.Models.Data;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class BaseApplication<T, S>
        where T : BaseModel
        where S : IService<T>
    {

        protected S Context { get; set; }

        public BaseApplication(S service)
        {
            this.Context = service;
        }

        public T FindById(long id)
        {
            return Context.GetById(id);
        }
        public T FindById(string id)
        {
            return Context.GetById(id);
        }

        public IEnumerable<T> FindAll()
        {
            return Context.GetAll();
        }

        /// <summary>
        /// 查找全部，并按照指定关键字段排序
        /// </summary>
        /// <typeparam name="TOrder"></typeparam>
        /// <param name="order"></param>
        /// <returns></returns>
        public IEnumerable<T> FindAll<TOrder>(Expression<Func<T, TOrder>> order)
        {
            return Context.GetAll(order);
        }

        /// <summary>
        /// 查找全部，并按照指定关键字段排序（逆序）
        /// </summary>
        /// <typeparam name="TOrder"></typeparam>
        /// <param name="order"></param>
        /// <returns></returns>
        public IEnumerable<T> FindAllDesc<TOrder>(Expression<Func<T, TOrder>> order)
        {
            return Context.GetAllDesc(order);
        }

        /// <summary>
        /// 查找全部，并按照指定时间排序（逆序）
        /// </summary>
        /// <typeparam name="TOrder"></typeparam>
        /// <param name="order"></param>
        /// <returns></returns>
        public IEnumerable<T> FindAllDesc()
        {
            return Context.GetAllDesc(m => m.Date);
        }

        /// <summary>
        /// 新增
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public void Add(T model)
        {
            Context.Add(model);
        }

        /// <summary>
        /// 修改
        /// </summary>
        /// <param name="model"></param>
        public void Update(T model)
        {
            Context.Update(model);
        }

        /// <summary>
        /// 删除（注意，是真正的删除）
        /// </summary>
        /// <param name="model"></param>
        public void Delete(T model)
        {
            Context.Delete(model);
        }


        /// <summary>
        /// 根据条件查询一个
        /// </summary>
        /// <param name="where"></param>
        public T FindByWhere(Expression<Func<T, bool>> where)
        {
            return Context.Get(where);
        }

        /// <summary>
        /// 根据条件查询一个一组
        /// </summary>
        /// <param name="where"></param>
        public IEnumerable<T> FindList(Expression<Func<T, bool>> where)
        {
            return Context.GetMany(where);
        }

        /// <summary>
        /// 根据条件查询和排序查询一组
        /// </summary>
        /// <param name="where">条件</param>
        /// <param name="order">排序</param>
        public IEnumerable<T> FindList<TOrder>(Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order)
        {
            return Context.GetMany(where, order);
        }

        /// <summary>
        /// 根据条件查询和【逆序】查询一组
        /// </summary>
        /// <typeparam name="TOrder"></typeparam>
        /// <param name="where">条件</param>
        /// <param name="order">排序</param>
        /// <returns></returns>
        public IEnumerable<T> FindListDesc<TOrder>(Expression<Func<T, bool>> where, Expression<Func<T, TOrder>> order)
        {
            return Context.GetManyDesc(where, order);
        }

        /// <summary>
        /// 分页查找（顺序）,isDelte = 0
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public IPagedList<T> FindByPage(Page page)
        {
            return Context.GetPage(page, m => m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 分页查找（倒序），isDelete = 1
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public IPagedList<T> FindByPageDesc(Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 提交数据，返回受影响的行数
        /// </summary>
        /// <returns>返回受影响的行数</returns>
        public int Submit()
        {
            return Context.Submit();
        }

        /// <summary>
        /// 提交数据，返回成功失败
        /// </summary>
        /// <returns>返回成功失败</returns>
        public bool Commit()
        {
            return Context.Submit() > 0;
        }
    }
}
