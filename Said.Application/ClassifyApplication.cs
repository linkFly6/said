using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    /// <summary>
    /// 分类逻辑中心
    /// </summary>
    public class ClassifyApplication : BaseApplication<Classify, IClassifyService>
    {

        public ClassifyApplication() : base(new ClassifyService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 根据ID删除
        /// </summary>
        /// <param name="id">ID</param>
        /// <returns>返回受影响的行数</returns>
        public void Delete(string id)
        {
            Context.Delete(m => m.ClassifyId == id);
        }
        /// <summary>
        /// 获取一个指定名称的分类对象
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public Classify FindByName(string name)
        {
            return Context.Get(m => m.CName == name);
        }

        /// <summary>
        /// 获取一组同名的分类对象
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public IEnumerable<Classify> FindListByName(string name)
        {
            return Context.GetMany(m => m.CName == name);
        }

    }
}
