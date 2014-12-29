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

        public static ISongService Context
        {
            get { return service ?? (service = new SongService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="song">实体</param>
        /// <returns></returns>
        public static int Add(Song song)
        {
            //if (string.IsNullOrEmpty())
            //    song.SongId = new Guid().ToString();
            //if (service.Submit() < 1)
            //    return string.Empty;
            //return song.SongId;
            Context.Add(song);
            return Context.Submit();
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

        #region 查询
        /// <summary>
        /// 检测是否存在该文件名的歌曲
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static Song FindByFileName(string fileName)
        {
            return Context.Get(m => m.SongFileName == fileName);
        }

        #endregion

    }
}
