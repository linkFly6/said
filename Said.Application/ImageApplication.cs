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
    public class ImageApplication
    {
        private static IImageService service;
        public static IImageService Context
        {
            get { return service ?? (service = new ImageService(new Domain.Said.Data.DatabaseFactory())); }
        }


        /// <summary>
        /// 添加一张图片
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Image model)
        {
            Context.Add(model);
            return service.Submit();
        }


        /// <summary>
        /// 修改图片
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(Image model)
        {
            Context.Update(model);
            return service.Submit();
        }

        /// <summary>
        /// 删除图片（物理删除）
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Delete(Image model)
        {
            Context.Delete(model);
            return service.Submit();
        }

        #region 逻辑

        #endregion


        #region 查询
        /// <summary>
        /// 查找
        /// </summary>
        /// <returns></returns>
        public static Image Find(string id)
        {
            return Context.GetById(id);
        }
        /// <summary>
        /// 根据图片的文件名查找
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static Image FindByFileName(string fileName)
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
        public static IPagedList<Image> FindToList(Models.Data.Page page)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0, m => m.Date);
        }

        /// <summary>
        /// 分页查询返回多条
        /// </summary>
        /// <param name="page"></param>
        /// <param name="keywords"></param>
        /// <returns></returns>
        public static IPagedList<Image> FindToList(Models.Data.Page page, ImageType type)
        {
            return Context.GetPageDesc(page, m => m.IsDel == 0 && m.Type == type, m => m.Date);
        }

        #endregion

    }
}
