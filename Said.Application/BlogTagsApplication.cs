using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class BlogTagsApplication
    {
        private static IBlogTagsService service;
        public static IBlogTagsService Context
        {
            get { return service ?? (service = new BlogTagsService(new Domain.Said.Data.DatabaseFactory())); }
        }


        public static int Add(BlogTags model)
        {
            Context.Add(model);
            return Context.Submit();
        }

        /// <summary>
        /// 新增一组BlogTags
        /// </summary>
        /// <param name="models"></param>
        /// <returns></returns>
        public static int AddLists(IList<BlogTags> models)
        {
            foreach (var item in models)
            {
                Context.Add(item);
            }
            return Context.Submit();
        }
    }
}
