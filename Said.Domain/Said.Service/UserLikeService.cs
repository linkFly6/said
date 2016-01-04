using Said.Domain.Said.Data;
using Said.IServices;
using Said.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Service
{
    /// <summary>
    /// 歌曲服务接口
    /// </summary>
    public interface IUserLikeService : IService<UserLike>
    {
        /// <summary>
        /// 查询一个用户是否Like了一篇Said
        /// </summary>
        /// <param name="id">SaidId</param>
        /// <param name="userId">用户Id</param>
        /// <returns></returns>
        UserLike UserIsLikeArticle(string id, string userId);

        /// <summary>
        /// 查询一个用户是否Like了一篇Blog
        /// </summary>
        /// <param name="id">BlogId</param>
        /// <param name="userId">用户Id</param>
        /// <returns></returns>
        UserLike UserIsLikeBlog(string id, string userId);
    }
    /// <summary>
    /// 歌曲服务
    /// </summary>
    public class UserLikeService : BaseService<UserLike>, IUserLikeService
    {

        public UserLikeService(DatabaseFactory factory)
            : base(factory)
        {

        }


        /// <summary>
        /// 查询一个用户是否Like了一篇Said
        /// </summary>
        /// <param name="id">SaidId</param>
        /// <param name="userId">用户Id</param>
        /// <returns></returns>
        public UserLike UserIsLikeArticle(string id, string userId)
        {
            return base.Get(m => m.LikeArticleId == id && m.LikeType == 0 && m.UserId == userId);
        }
        /// <summary>
        /// 查询一个用户是否Like了一篇Blog
        /// </summary>
        /// <param name="id">BlogId</param>
        /// <param name="userId">用户Id</param>
        /// <returns></returns>
        public UserLike UserIsLikeBlog(string id, string userId)
        {
            return base.Get(m => m.LikeArticleId == id && m.LikeType == 1 && m.UserId == userId);
        }
    }

}
