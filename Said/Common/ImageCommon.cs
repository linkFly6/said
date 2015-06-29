using Said.Helper;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;

namespace Said.Common
{
    public class ImageCommon
    {
        private static readonly double ratio = 1.82;


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
        /// <param name="saveUrl">图片保存url</param>
        /// <returns></returns>
        public static bool CutImg(string url, string saveUrl)
        {
            return CutImg(url, ratio, saveUrl);
        }

        /// <summary>
        /// 裁剪一张图片
        /// </summary>
        /// <param name="url"></param>
        /// <param name="ratio"></param>
        /// <param name="saveUrl"></param>
        /// <returns></returns>
        public static bool CutImg(string url, double ratio, string saveUrl)
        {
            if (FileCommon.Exists(url))
            {
                using (Bitmap bitmap = new Bitmap(url))
                {
                    using (Bitmap image = ImageClass.CutImg(bitmap, ratio))
                    {
                        image.Save(saveUrl);
                        return true;
                    }
                }
            }
            return false;
        }







    }
}