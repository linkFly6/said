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
    /// User处理程序
    /// </summary>
    public static class UserLikeApplication
    {
        private static IUserLikeService service;
        public static IUserLikeService Context
        {
            get { return service ?? (service = new UserLikeService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一个User
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(UserLike model)
        {
            Context.Add(model);
            return service.Submit();
        }


        /// <summary>
        /// 查找User
        /// </summary>
        /// <returns></returns>
        public static UserLike Find(string id)
        {
            return Context.GetById(id);
        }

        /// <summary>
        /// 检测用户是否like了一篇Said/Blog
        /// </summary>
        /// <param name="id">文章Id</param>
        /// <param name="userId">用户ID</param>
        /// <param name="type">要查询的Like类型： 0 - Said 、 1 - Blog</param>
        /// <returns></returns>
        public static UserLike ExistsLike(string id, string userId, int type)
        {
            switch (type)
            {
                case 0:
                    return Context.UserIsLikeArticle(id, userId);
                default:
                    return Context.UserIsLikeBlog(id, userId);
            }
        }

    }
}
