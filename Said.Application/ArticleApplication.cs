using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public static class ArticleApplication
    {
        private static IArticleService service;
        public static IArticleService Service
        {
            get { return service ?? (service = new ArticleService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一篇文章
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Article model)
        {
            service.Add(model);
            return service.Submit();
        }
    }
}
