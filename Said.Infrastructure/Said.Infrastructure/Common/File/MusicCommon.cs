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
        public static string GetFileInfo(string filePath)
        {
            ShellClass sh = new ShellClass();
            Folder dir = sh.NameSpace(Path.GetDirectoryName(filePath));
            FolderItem item = dir.ParseName(Path.GetFileName(filePath));
            StringBuilder sb = new StringBuilder();
            for (int i = -1; i < 50; i++)
            {
                // 0 Retrieves the name of the item. 
                // 1 Retrieves the size of the item. 
                // 2 Retrieves the type of the item. 
                // 3 Retrieves the date and time that the item was last modified. 
                // 4 Retrieves the attributes of the item. 
                // -1 Retrieves the info tip information for the item. 
                sb.Append(i.ToString());
                sb.Append(":");
                sb.Append(dir.GetDetailsOf(item, i));
                sb.Append("rn");
            }
            return sb.ToString();
        }


    }
}
