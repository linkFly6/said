using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    public class FileCommon
    {
        /// <summary>
        /// 检测一个文件夹路径，如果该路径不存在则创建该文件夹路径
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static string ExistsCreate(string path)
        {
            if (!Directory.Exists(path))
            {
                try
                {
                    Directory.CreateDirectory(path);
                    return path;
                }
                catch (Exception)
                {
                    return null;
                }
            }
            return path;
        }
        /// <summary>
        /// 获取文件真实的类型
        /// </summary>
        /// <param name="path">要获取文件类型的文件路径</param>
        /// <returns>返回文件类型（后缀名）的枚举，不是已知的文件类型返回FileExtendsion.unknown</returns>
        public static FileExtendsion GetExtension(string path)
        {
            using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read))
            {
                using (BinaryReader r = new BinaryReader(fs))
                {
                    string fileclass = "",
                    ext = string.Empty;
                    byte buffer;
                    try
                    {
                        buffer = r.ReadByte();
                        fileclass = buffer.ToString();
                        buffer = r.ReadByte();
                        fileclass += buffer.ToString();
                    }
                    catch
                    {
                        return FileExtendsion.unknown;
                    }
                    foreach (FileExtendsion item in Enum.GetValues(typeof(FileExtendsion)))
                    {
                        if (item.ToString() == fileclass) return item;
                    }
                }
            }
            return FileExtendsion.unknown;
        }

        /// <summary>
        /// 根据Guid生成一个文件名
        /// </summary>
        /// <param name="isTrim">是否修剪（修剪Guid生成的-连字符）</param>
        /// <returns>生成的文件名</returns>
        public static string CreateFileNameByID(bool isTrim = false)
        {
            return isTrim ? Guid.NewGuid().ToString().Replace("-", string.Empty) : Guid.NewGuid().ToString();
        }
        /// <summary>
        /// 根据时间生成一个文件名
        /// </summary>
        /// <param name="format">指定一个时间格式</param>
        /// <returns>生成的文件名</returns>
        public static string CreateFileNameByTime(string format = null)
        {
            if (string.IsNullOrEmpty(format))
                format = "ffffyyyymmddHHssMM";//乱七八糟的格式~~~~
            return DateTime.Now.ToString(format, DateTimeFormatInfo.InvariantInfo);
        }
    }
    public enum FileExtendsion
    {
        txt = 4946 | 104116 | 239187,
        gif = 7173,
        jpg = 255216,
        png = 13780,
        bmp = 6677,
        aspx = 239187,
        asp = 239187,
        sql = 239187,
        xls = 208207,
        doc = 208207,
        ppt = 208207,
        xml = 6063,
        htm = 6033,
        html = 6033,
        js = 4742,
        xlsx = 8075,
        pptx = 8075,
        mmap = 8075,
        zip = 8075,
        rar = 8297,
        accdb, mdb = 01,
        exe, dll = 7790,
        psd = 5666,
        rdp = 255254,
        bt = 10056,
        bat = 64101,
        sgf = 4059,
        unknown = -1
    }
}
