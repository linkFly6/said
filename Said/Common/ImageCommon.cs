using Said.Helper;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// Said站点图片处理类
    /// </summary>
    public class ImageCommon
    {
        /*
            Said需要保证非常高质量的图片，所以约定了图片的比例、最小宽度和高度，以便带来更卓越的用户体验
         */

        /// <summary>
        /// 默认比例
        /// </summary>
        private static readonly double ratio = 1.82;
        /// <summary>
        /// 图片允许的最小高度
        /// </summary>
        private static readonly double minHeight = 900;
        /// <summary>
        /// 图片允许的最小宽度
        /// </summary>
        private static readonly double minWidth = minHeight * ratio;


        private static readonly int ThumbnailMinHeight = 400;

        private static readonly int ThumbnailMinWidth = 840;

        #region CutImg（裁剪图片）
        /// <summary>
        /// 裁剪一张图片，默认按照1.82比例裁剪
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static bool CutImg(string path)
        {
            return CutImg(path, ratio, path);
        }

        public static bool CutImg(string path, double ratio)
        {
            return CutImg(path, ratio, path);
        }

        /// <summary>
        /// 裁剪一张图片，默认按照1.82比例裁剪
        /// </summary>
        /// <param name="path">图片读取url</param>
        /// <param name="savePath">图片保存url（含文件名）</param>
        /// <returns></returns>
        public static bool CutImg(string path, string savePath)
        {
            return CutImg(path, ratio, savePath);
        }

        /// <summary>
        /// 裁剪一张图片
        /// </summary>
        /// <param name="path">图片url（含文件名）</param>
        /// <param name="ratio">图片比例</param>
        /// <param name="savePath">图片新的url（含文件名）</param>
        /// <returns></returns>
        public static bool CutImg(string path, double ratio, string savePath)
        {
            if (FileCommon.Exists(path))
            {
                try
                {
                    Bitmap bitmap = new Bitmap(path);
                    //本身比例就是对的，就不用处理了
                    if (bitmap.Width / bitmap.Height == ratio)
                        return true;
                    using (Bitmap image = ImageClass.CutImg(bitmap, ratio))
                    {
                        //释放原图片线程，因为有可能要覆盖原文件
                        bitmap.Dispose();
                        //根据url得到原文件的一些信息
                        //string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(path);//无扩展名的文件名
                        //string dir = Path.GetDirectoryName(path);//文件目录路径
                        //string extension = Path.GetExtension(path);//文件后缀名
                        /*
                         *  默认是按照System.Drawing.Imaging.ImageFormat.Bmp保存
                         *  指定图片存储存储格式，默认是bmp（所以会把一张1mb的图片生成出8mb）                            
                         */
                        image.Save(savePath, GetImageFormat(Path.GetExtension(path)));
                        return true;
                    }
                }
                catch (Exception)
                {
                    return false;
                }
            }
            return false;
        }
        #endregion




        #region MakeThumbnail（生成缩略图）
        /// <summary>
        /// 生成缩略图
        /// </summary>
        /// <param name="path"></param>
        /// <param name="savePath"></param>
        /// <returns></returns>
        public static bool MakeThumbnail(string path, string savePath)
        {
            if (FileCommon.Exists(path))
            {
                try
                {
                    Bitmap bitmap = new Bitmap(path);
                    using (Bitmap image = ImageClass.MakeThumbnail(bitmap, ThumbnailMinWidth, ThumbnailMinHeight))
                    {
                        bitmap.Dispose();
                        //缩略图一律默认jpeg格式
                        string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(savePath);//无扩展名的文件名
                        string dir = Path.GetDirectoryName(savePath);//文件目录路径
                        image.Save(dir + fileNameWithoutExtension + ".jpg", ImageFormat.Jpeg);
                        return true;
                    }
                }
                catch (Exception)
                {
                    return false;
                }
            }
            return false;
        }
        #endregion



        #region CheckImage（检测图片是否适合裁剪或者缩略）
        public static bool CheckImage(string url)
        {
            return true;
        }

        public static bool CheckImage(HttpPostedFileBase file)
        {

            return true;
        }
        #endregion

        private static ImageFormat GetImageFormat(string extension)
        {
            extension = extension.ToLower();
            switch (extension)
            {
                case ".gif":
                    return ImageFormat.Gif;
                case ".png":
                    return ImageFormat.Png;
                //case "jpg":
                //case "jpeg":
                //case "jpe":
                //case "bmp":
                default:
                    return ImageFormat.Jpeg;
            }
        }

    }
}