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
    /// <summary>
    /// 图片逻辑中心
    /// </summary>
    public class ImageApplication : BaseApplication<Image, IImageService>
    {

        public ImageApplication() : base(new ImageService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }


        /// <summary>
        /// 减去一次图片的引用
        /// </summary>
        /// <param name="id">要操作的图片ID</param>
        /// <returns></returns>
        public bool MinusReferenceCount(string id)
        {
            Image model = Context.GetById(id);
            if (model == null || model.ReferenceCount <= 0)
                return false;
            model.ReferenceCount -= 1;
            Context.Update(model);
            return true;
        }

        /// <summary>
        /// 增加一次图片引用
        /// </summary>
        /// <param name="id">要操作的图片ID</param>
        /// <returns></returns>
        public bool AddReferenceCount(string id)
        {
            Image model = Context.GetById(id);
            if (model == null || model.ReferenceCount <= 0)
                return false;
            model.ReferenceCount += 1;
            Context.Update(model);
            return true;
        }


        #region 逻辑

        #endregion


        #region 查询
        /// <summary>
        /// 根据图片的文件名查找
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public Image FindByFileName(string fileName)
        {
            return Context.Get(m => m.IFileName == fileName);
        }

        ///// <summary>
        ///// 分页查询返回单条
        ///// </summary>
        ///// <param name="page">分页对象</param>
        ///// <returns>返回封装后的IPagedList对象</returns>
        //public static IPagedList<Image> Find(Models.Data.Page page)
        //{
        //    return Context.GetPage(page, m => m.IsDel == 0, m => m.Date);
        //}

        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public IPagedList<Image> FindToList(Models.Data.Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public IPagedList<Image> FindToList(Models.Data.Page page, ImageType type)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Type == type, m => m.Date);
        }

        #endregion

    }
}
