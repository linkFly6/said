using Shell32;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    public class MusicCommon
    {

        /// <summary>
        /// 获取MP3之类的音乐文件的属性
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        public static MusicInfo GetFileInfo(string filePath)
        {
            ShellClass sh = new ShellClass();
          
            Folder dir = sh.NameSpace(Path.GetDirectoryName(filePath));
            FolderItem item = dir.ParseName(Path.GetFileName(filePath));

            //StringBuilder sb = new StringBuilder();
            //for (int i = -1; i < 87; i++)
            //{
            //    sb.AppendFormat("{0}:{1}\n", i, dir.GetDetailsOf(item, i));
            //}
            //sb.ToString();
            return new MusicInfo
            {
                Album = dir.GetDetailsOf(item, 14),
                Artists = dir.GetDetailsOf(item, 13),
                BitRate = Said.Helper.ConvertHelper.StringToInt(dir.GetDetailsOf(item, 28)),
                Length = dir.GetDetailsOf(item, 27),
                //Size = dir.GetDetailsOf(item, 1),
                Title = dir.GetDetailsOf(item, 21),
                Type = dir.GetDetailsOf(item, 2)
            };
        }


    }
}
