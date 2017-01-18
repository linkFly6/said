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
    public class SongApplication : BaseApplication<Song, ISongService>
    {

        public SongApplication() : base(new SongService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 验证音乐
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public string ValidateAndCorrectSubmit(Song model, ImageApplication imageApplication)
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
            if (model.Duration < 1)
            {
                return "歌曲时长不正确";
            }
            if (model.SongSize < 1)
            {
                return "歌曲大小不正确";
            }
            /*
             *  Error：一个实体对象不能由多个 IEntityChangeTracker 实例引用。
             *  不能给原Model赋值！！只能给ImageId属性赋值，如果给原Model赋值，因为不同的DbContext，导致EF认为这个Image是新增的，但其实是引用
             *  
             *  参考：
             *  http://m.blog.csdn.net/blog/jerry_cool_2010/6922095
             *  http://www.tuicool.com/articles/zEjEJn
             *  http://q.cnblogs.com/q/43962/
             */
            //model.Image = ImageApplication.Find(model.ImageId);
            Image image = imageApplication.FindById(model.ImageId);
            if (image == null)
            {
                return "歌曲不正确（不可获取）";
            }
            else
            {
                //更新引用
                image.ReferenceCount += 1;
                imageApplication.Update(image);
                if (!imageApplication.Commit())
                {
                    return "删除歌曲图片异常";
                }
            }

            return null;
        }

        #region 查询
        /// <summary>
        /// 检测是否存在该文件名的歌曲
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public Song FindByFileName(string fileName)
        {
            return Context.Get(m => m.SongFileName == fileName);
        }

        /// <summary>
        /// 无条件查询全部，并按照时间倒序排列
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Song> FindToList()
        {
            return Context.GetAllDesc(m => m.Date);
        }

        /// <summary>
        /// 无条件贪婪查询全部，并按照时间倒序排列
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Song> FindAllByDesc()
        {
            return Context.FindAllByDesc();
        }

        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public IPagedList<Song> FindToList(Models.Data.Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }


        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords">查询关键字</param>
        /// <returns></returns>
        public IPagedList<Song> FindToList(Models.Data.Page page, string keywords)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && (m.SongName.Contains(keywords) || m.SongArtist.Contains(keywords) || m.SongAlbum.Contains(keywords)), m => m.Date);
        }
        #endregion

    }
}
