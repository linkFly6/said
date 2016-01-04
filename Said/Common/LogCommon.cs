using log4net;
using log4net.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// 日志类（log4net驱动）
    /// </summary>
    public class LogCommon
    {
        /// <summary>
        /// 正常日志
        /// </summary>
        public static readonly ILog loginfo = log4net.LogManager.GetLogger("loginfo");
        /// <summary>
        /// Error日志
        /// </summary>
        public static readonly ILog logerror = log4net.LogManager.GetLogger("logerror");

        /// <summary>
        /// 输出日志
        /// </summary>
        /// <param name="msg"></param>
        public static void Log(string msg)
        {
            if (loginfo.IsInfoEnabled)
                loginfo.Info(msg);
        }

        /// <summary>
        /// 输出日志
        /// </summary>
        /// <param name="msg"></param>
        public static void Log(string msg, Exception e)
        {
            if (loginfo.IsInfoEnabled)
                loginfo.Info(msg);
        }


        /// <summary>
        /// 输出日志
        /// </summary>
        /// <param name="msg"></param>
        public static void Log(Exception e)
        {
            if (loginfo.IsErrorEnabled)
                loginfo.Info(e);
        }

        /// <summary>
        /// 输出运行（逻辑）错误日志
        /// </summary>
        /// <param name="msg"></param>
        /// <param name="e"></param>
        public static void Error(string msg)
        {
            if (logerror.IsErrorEnabled)
                logerror.Error(msg);
        }


        /// <summary>
        /// 输出运行（逻辑）错误日志
        /// </summary>
        /// <param name="msg"></param>
        /// <param name="e"></param>
        public static void Error(Exception e)
        {
            if (logerror.IsErrorEnabled)
                logerror.Error(e);
        }

        /// <summary>
        /// 输出运行（逻辑）错误日志
        /// </summary>
        /// <param name="msg"></param>
        /// <param name="e"></param>
        public static void Error(string msg, Exception e)
        {
            if (logerror.IsErrorEnabled)
                logerror.Error(msg, e);
        }

    }
}