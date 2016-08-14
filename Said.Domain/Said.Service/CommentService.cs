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
    /// 标签服务接口
    /// </summary>
    public interface ICommentServicee : IService<Comment>
    {

    }
    /// <summary>
    /// 标签服务
    /// </summary>
    public class CommentService : BaseService<Comment>, ICommentServicee
    {

        public CommentService(DatabaseFactory factory)
            : base(factory)
        {

        }
    }

}
