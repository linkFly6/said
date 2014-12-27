using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public static class ClassifyApplication
    {
        private static IClassifyService service;
        public static IClassifyService Context
        {
            get { return service ?? (service = new ClassifyService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="song">实体</param>
        /// <returns></returns>
        public static string Add(Classify model)
        {
            return string.Empty;
        }
    }
}
