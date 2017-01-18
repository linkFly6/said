using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class TagApplication : BaseApplication<Tag, ITagService>
    {
        public TagApplication() : base(new TagService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 添加一组tag
        /// </summary>
        /// <param name="models">Tag集合</param>
        /// <returns></returns>
        public void AddList(IEnumerable<Tag> models)
        {
            foreach (var item in models)
            {
                Context.Add(item);
            }
        }

        /// <summary>
        /// 根据ID删除
        /// </summary>
        /// <param name="id">ID</param>
        /// <returns>返回受影响的行数</returns>
        public void Delete(string id)
        {
            Context.Delete(m => m.TagId == id);
            //return Context.Submit();
        }


        /// <summary>
        /// 根据名称查找Tag
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public Tag FindByName(string name)
        {
            return Context.Get(m => m.TagName == name);
        }

        /// <summary>
        /// 根据名称查找一组tag
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public IEnumerable<Tag> FindListByName(string name)
        {
            return Context.GetMany(m => m.TagName == name);
        }

        /// <summary>
        /// 根据一组ID和name查询到一组Tag（因为Tag的id和name是复合主键（要求都不能重复），所以需要两个条件进行容错）
        /// </summary>
        /// <param name="namesOrIds">要查询的TagId和name列表</param>
        /// <returns></returns>
        public IEnumerable<Tag> FindListByTagIdList(string[] namesOrIds)
        {
            return Context.GetMany(m => namesOrIds.Contains(m.TagId));
        }
    }
}
