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
    public class BannerApplication : BaseApplication<Banner, IBannerService>
    {
        public BannerApplication() : base(new BannerService(Domain.Said.Data.DatabaseFactory.Get()))
        {
        }

        /// <summary>
        /// 获取指定数量的横幅（日期倒序）
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Banner> GetTop(int count)
        {
            return Context.GetTop(count);
        }

        /// <summary>
        /// 分页查询
        /// </summary>
        /// <param name="page">分页对象</param>
        /// <param name="keywords">要查询的关键字</param>
        /// <returns>返回封装后的IPagedList对象</returns>
        public IPagedList<Banner> Find(Models.Data.Page page, string keywords)
        {
            return Context.GetPage(page, m => m.Description.Contains(keywords), m => m.Date);
        }



        #region 逻辑
        /// <summary>
        /// 验证和修正新增的Banner对象
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public string ValidateAndCorrectSubmit(Banner model, ImageApplication imageApplication)
        {
            if (model == null) return "服务器接收的数据不正确";
            if (string.IsNullOrWhiteSpace(model.Link))
            {
                return "Banner链接不允许为空";
            }
            if (string.IsNullOrWhiteSpace(model.SourceCode) || string.IsNullOrWhiteSpace(model.HTML))
                return "Banner文本源码不允许为空";
            if (string.IsNullOrWhiteSpace(model.ImageId))
            {
                return "Banner图片不正确";
            }
            if (imageApplication.FindById(model.ImageId) == null)
            {
                return "没有找到正确的Banner图片";
            }
            return string.Empty;
        }
        #endregion
    }

}
