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
        /// <summary>
        /// 贪婪查询全部，按照时间倒序排列
        /// </summary>
        /// <returns></returns>
        IEnumerable<Song> FindAllByDesc();
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

        /// <summary>
        /// 贪婪查询全部，按照时间倒序排列
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Song> FindAllByDesc()
        {
            var query = from m in Context.Song.Include("Image")
                        orderby m.Date descending
                        select m;
            return query;
        }
    }

}
