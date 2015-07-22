using PagedList;
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
        /// 验证音乐
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static string ValidateAndCorrectSubmit(Song model)
        {
            if (string.IsNullOrWhiteSpace(model.SongName))
            {
                return "歌曲名称不可为空（不可获取）";
            }
            if (string.IsNullOrWhiteSpace(model.ImageId))
            {
                return "歌曲图片不可为空（不可获取）";
            }
            if (string.IsNullOrWhiteSpace(model.SongArtist))
            {
                return "歌手不可为空（不可获取）";
            }
            if (string.IsNullOrWhiteSpace(model.SongFileName))
            {
                return "歌曲文件名不可为空（不可获取）";
            }
            model.Image = ImageApplication.Find(model.ImageId);
            if (model.Image == null)
            {
                return "歌曲不正确（不可获取）";
            }

            return null;
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
        /// 删除（物理删除）
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Delete(Song model)
        {
            Context.Delete(model);
            return service.Submit();
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

        /// <summary>
        /// 根据长ID查找一个分类
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Song Find(long id)
        {
            return Context.GetById(id);
        }
        /// <summary>
        /// 根据ID查找一个分类
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Song Find(string id)
        {
            return Context.GetById(id);
        }
        /// <summary>
        /// 无条件查询全部
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Song> Find()
        {
            return Context.GetAll();
        }

        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public static IPagedList<Song> FindToList(Models.Data.Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }


        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords">查询关键字</param>
        /// <returns></returns>
        public static IPagedList<Song> FindToList(Models.Data.Page page, string keywords)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && (m.SongName.Contains(keywords) || m.SongArtist.Contains(keywords) || m.SongAlbum.Contains(keywords)), m => m.Date);
        }
        #endregion

    }
}
