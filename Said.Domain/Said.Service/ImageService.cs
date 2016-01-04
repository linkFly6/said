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
    /// 图片接口
    /// </summary>
    public interface IImageService : IService<Image>
    {

    }

    /// <summary>
    /// 图片服务
    /// </summary>
    public class ImageService : BaseService<Image>, IImageService
    {
        public ImageService(DatabaseFactory factory)
            : base(factory)
        {

        }
    }
}
