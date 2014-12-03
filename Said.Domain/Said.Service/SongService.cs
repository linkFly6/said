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
    public interface ISongService : IService<Song>
    {

    }
    /// <summary>
    /// 歌曲服务
    /// </summary>
    public class SongService : BaseService<Song>, ISongService
    {

        public SongService(DatabaseFactory factory)
            : base(factory)
        {

        }
    }

}
