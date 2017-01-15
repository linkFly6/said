using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// 为了性能，某些频繁操作做一个缓存，当某个函数执行到指定的次数之后再真正执行这个函数，否则将这个函数置入内存
    /// </summary>
    /// <typeparam name="T">保存的数据类型</typeparam>
    /// <typeparam name="TResult">函数运行的结果</typeparam>
    public class LazyFunc<T, TResult> : IDisposable
    {

        /// <summary>
        /// 数据缓存
        /// </summary>
        private IList<T> datas = new List<T>();

        /// <summary>
        /// 数据读取
        /// </summary>
        private Func<IList<T>, TResult> lastFunc = null;


        private int MaxCount = 5;

        /// <summary>
        /// 当前执行过的次数
        /// </summary>
        private int currCount = 0;

        /// <summary>
        /// 执行时机根据次数决定
        /// </summary>
        /// <param name="count"></param>
        public LazyFunc(int maxCount)
        {
            MaxCount = maxCount;
        }

        /// <summary>
        /// 默认最大缓冲次数为5次
        /// </summary>
        /// <param name="count"></param>
        public LazyFunc()
        {
        }


        public LazyFunc<T, TResult> SetData(T data)
        {
            datas.Add(data);
            return this;
        }

        public TResult Lazy(Func<IList<T>, TResult> func)
        {
            if (currCount < MaxCount)
            {
                // 保存最后一次
                lastFunc = func;
                currCount++;
                return default(TResult);
            }
            currCount = 0;
            return func(datas);
        }

        public TResult Lazy(T data, Func<IList<T>, TResult> func)
        {
            return this.SetData(data).Lazy(func);
        }



        public void Dispose()
        {

            // 处理掉未处理的任务
            lastFunc(datas);
            GC.SuppressFinalize(this);
        }
    }
}