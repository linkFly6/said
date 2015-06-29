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

        #region 检测一个文件夹路径，如果该路径不存在则创建该文件夹路径
        /// <summary>
        /// 检测一个文件夹路径，如果该路径不存在则创建该文件夹路径
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static bool ExistsCreate(string path)
        {
            if (!Directory.Exists(path))
            {
                try
                {
                    Directory.CreateDirectory(path);
                    return true;
                }
                catch (Exception) { return false; }
            }
            return true;
        }
        #endregion

        #region 检测一个文件/文件夹路径，当路径以"/"结尾则检测文件夹
        /// <summary>
        /// 检测一个文件/文件夹路径，当路径以"/"结尾则检测文件夹
        /// </summary>
        /// <param name="path">要检测的路径，当路径以"/"结尾则检测文件夹，否则检测文件</param>
        /// <returns>文件/文件夹是否存在</returns>
        public static bool Exists(string path)
        {
            return string.IsNullOrEmpty(path) ?
                false :
                path.EndsWith("/") || path.EndsWith("\\") ?
                Directory.Exists(path) :
                File.Exists(path);
        }
        #endregion


        #region 获取指定目录及子目录中所有文件列表
        /// <summary>
        /// 获取指定目录及子目录中所有文件列表
        /// </summary>
        /// <param name="directoryPath">指定目录的绝对路径</param>
        /// <param name="searchPattern">模式字符串，"*"代表0或N个字符，"?"代表1个字符。
        /// 范例："Log*.xml"表示搜索所有以Log开头的Xml文件。</param>
        /// <param name="isSearchChild">是否搜索子目录</param>
        public static string[] GetFileNames(string directoryPath, string searchPattern, bool isSearchChild)
        {
            //如果目录不存在，则抛出异常
            if (!Exists(directoryPath))
                return null;
            try
            {
                if (isSearchChild)
                {
                    return Directory.GetFiles(directoryPath, searchPattern, SearchOption.AllDirectories);
                }
                else
                {
                    return Directory.GetFiles(directoryPath, searchPattern, SearchOption.TopDirectoryOnly);
                }
            }
            catch (IOException ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// 获取指定目录及子目录中所有文件列表
        /// </summary>
        /// <param name="directoryPath">指定目录的绝对路径</param>
        /// <param name="searchPattern">模式字符串，"*"代表0或N个字符，"?"代表1个字符。
        /// 范例："Log*.xml"表示搜索所有以Log开头的Xml文件。</param>
        /// <param name="isSearchChild">是否搜索子目录</param>
        public static string[] GetFileNames(string directoryPath, bool isSearchChild = false)
        {
            //如果目录不存在，则抛出异常
            if (!Exists(directoryPath))
                return null;
            try
            {
                if (isSearchChild)
                {
                    return Directory.GetFiles(directoryPath, "*", SearchOption.AllDirectories);
                }
                else
                {
                    return Directory.GetFiles(directoryPath, "*", SearchOption.TopDirectoryOnly);
                }
            }
            catch (IOException ex)
            {
                throw ex;
            }
        }
        #endregion

        #region 获取一个路径的文件名
        /// <summary>
        /// 获取一个路径的文件名
        /// </summary>
        /// <param name="path">路径</param>
        /// <returns>返回文件名</returns>
        public static string getFileName(string path)
        {
            return Path.GetFileName(path);
        }
        #endregion

        #region 获取文件真实的类型
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
        #endregion

        #region 根据Guid生成一个文件名
        /// <summary>
        /// 根据Guid生成一个文件名
        /// </summary>
        /// <param name="isTrim">是否修剪（修剪Guid生成的-连字符）</param>
        /// <returns>生成的文件名</returns>
        public static string CreateFileNameByID(bool isTrim = false)
        {
            return isTrim ? Guid.NewGuid().ToString().Replace("-", string.Empty) : Guid.NewGuid().ToString();
        }
        #endregion

        #region 根据时间生成一个文件名
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
        #endregion


        #region 读取一个文件的到String
        /// <summary>
        /// 读取一个文件的到String
        /// </summary>
        /// <param name="path">路径</param>
        /// <returns>读取到的文件</returns>
        public static string ReadToString(string path)
        {
            Encoding code = Encoding.GetEncoding("gb2312");
            string str = string.Empty;
            if (File.Exists(path))
            {
                StreamReader sr = null;
                try
                {
                    sr = new StreamReader(path, code);
                    str = sr.ReadToEnd(); // 读取文件
                }
                catch { }
                sr.Close();
                sr.Dispose();
            }
            else
            {
                str = string.Empty;
            }


            return str;
        }
        #endregion

        #region 移动一个文件到新的文件夹
        /// <summary>
        /// 移动一个文件到新的文件夹
        /// </summary>
        /// <param name="path">原路径</param>
        /// <param name="newPath">新路径（如果没有则自动创建）</param>
        /// <param name="isConvert">如果是windows系统，默认需要进行path转义</param>
        public static void Move(string path, string newPath, bool isConvert = true)
        {
            string symbol = isConvert ? "\\" : "/";
            if (isConvert)
            {
                path = path.Replace("/", "\\");
                newPath = newPath.Replace("/", "\\");
            }
            string newDir = newPath.Substring(0, newPath.LastIndexOf(symbol) + 1);
            if (File.Exists(path) && FileCommon.ExistsCreate(newDir))
                File.Move(path, newPath);
        }
        #endregion

        #region 删除一个文件
        /// <summary>
        /// 删除一个文件
        /// </summary>
        /// <param name="path">删除文件的路径</param>
        /// <returns></returns>
        public static bool Remove(string path)
        {
            try
            {
                if (File.Exists(path))
                    File.Delete(path);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        #endregion

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
