using Said.IServices;
using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class BaseApplication<T, S>
        where T : BaseModel
        where S : IService<T>
    {

        protected S Service { get; set; }
        public BaseApplication(S service)
        {
            this.Service = service;
        }

        public T Find(long id)
        {
            return Service.GetById(id);
        }
        public T Find(string id)
        {
            return Service.GetById(id);
        }

        public IEnumerable<T> Find()
        {
            return Service.GetAll();
        }

        /// <summary>
        /// 添加一篇模型到数据库
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public int Add(T model)
        {
            Service.Add(model);
            return Service.Submit();
        }
    }
}
