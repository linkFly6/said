using Said.Helper;
using System;
using System.Collections.Generic;
using System.Drawing;
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


        /// <summary>
        /// 裁剪一张图片，默认按照1.82比例裁剪
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public static bool CutImg(string url)
        {
            return CutImg(url, ratio, url);
        }

        public static bool CutImg(string url, double ratio)
        {
            return CutImg(url, ratio, url);
        }

        /// <summary>
        /// 裁剪一张图片，默认按照1.82比例裁剪
        /// </summary>
        /// <param name="url">图片读取url</param>
        /// <param name="saveUrl">图片保存url（含文件名）</param>
        /// <returns></returns>
        public static bool CutImg(string url, string saveUrl)
        {
            return CutImg(url, ratio, saveUrl);
        }

        /// <summary>
        /// 裁剪一张图片
        /// </summary>
        /// <param name="url">图片url（含文件名）</param>
        /// <param name="ratio">图片比例</param>
        /// <param name="saveUrl">图片新的url（含文件名）</param>
        /// <returns></returns>
        public static bool CutImg(string url, double ratio, string saveUrl)
        {
            if (FileCommon.Exists(url))
            {
                try
                {
                    Bitmap bitmap = new Bitmap(url);
                    //本身比例就是对的...
                    if (bitmap.Width / bitmap.Height == ratio)
                        return true;
                    using (Bitmap image = ImageClass.CutImg(bitmap, ratio))
                    {
                        bitmap.Dispose();
                        //这里保存图片，被线程占用了
                        image.Save(saveUrl);
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


        public static bool CheckImage(string url)
        {
            return true;
        }

        public static bool CheckImage(HttpPostedFileBase file)
        {
            
            return true;
        }



    }
}