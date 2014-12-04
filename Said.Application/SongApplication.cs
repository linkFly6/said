using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public static class SongApplication
    {
        private static ISongService service;

        public static ISongService Service
        {
            get { return service ?? (service = new SongService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="song">实体</param>
        /// <returns></returns>
        public static string Add(Song song)
        {
            if (string.IsNullOrEmpty(song.SongId))
                song.SongId = new Guid().ToString();
            if (service.Submit() < 1)
                return string.Empty;
            return song.SongId;
        }
        /// <summary>
        /// 修改
        /// </summary>
        /// <param name="song"></param>
        /// <returns></returns>
        public static int Update(Song song)
        {
            if (string.IsNullOrEmpty(song.SongId)) return -1;
            service.Update(song);
            return service.Submit(); 
        }

    }
}
