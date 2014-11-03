using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services.Said.IServices
{
    interface ISaidService<T>
    {
        #region 增加
        int Add(T t);
        #endregion

        #region 删除
        int Del(string saidId);
        int Delete(string saidId);
        #endregion

        #region 修改
        int UpState(string saidId, int state);

        #endregion

        #region 查询
        /// <summary>
        /// 根据关键词查询并分页返回结果
        /// </summary>
        /// <param name="keywords"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageCount"></param>
        /// <returns></returns>
        IList<T> FindByKeywords(string keywords, int pageIndex, int pageCount);

        /// <summary>
        /// 根据关键词查询并返回查询得到的数据个数
        /// </summary>
        /// <param name="keywords"></param>
        /// <returns></returns>
        int FindByKeywordsCount(string keywords);

        /// <summary>
        /// 根据ID查询一条记录
        /// </summary>
        /// <param name="saidId"></param>
        /// <returns></returns>
        T One(string saidId);

        /// <summary>
        /// 无条件查询全部并分页
        /// </summary>
        /// <param name="pageIndex"></param>
        /// <param name="pageCount"></param>
        /// <returns></returns>
        IList<T> All(int pageIndex, int pageCount);
        /// <summary>
        /// 无条件查询全部并返回查询得到的结果个数
        /// </summary>
        /// <param name="pageIndex"></param>
        /// <param name="pageCount"></param>
        /// <returns></returns>
        int AllCount(int pageIndex, int pageCount);


        #endregion
    }
}
