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
        public static readonly log4net.ILog loginfo = log4net.LogManager.GetLogger("loginfo");
        /// <summary>
        /// Error日志
        /// </summary>
        public static readonly log4net.ILog logerror = log4net.LogManager.GetLogger("logerror");
        /// <summary>
        /// 数据库日志
        /// </summary>
        public static readonly log4net.ILog logedata = log4net.LogManager.GetLogger("logdata");

        /// <summary>
        /// 输出日志
        /// </summary>
        /// <param name="msg"></param>
        public static void Info(string msg)
        {
            if (loginfo.IsInfoEnabled)
                loginfo.Info(msg);
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


        /// <summary>
        /// 输出运行（逻辑）错误日志
        /// </summary>
        /// <param name="msg"></param>
        /// <param name="e"></param>
        public static void Error(Exception e)
        {
            if (logerror.IsErrorEnabled)
                logerror.Error(string.Format("{0}/r/n{1}/r/n{2}/r/n{3}/r/n",
                        e.Message.ToString(),
                        e.Source.ToString(),
                        e.TargetSite.ToString(),
                        e.StackTrace.ToString()));
        }

        /// <summary>
        /// 输出数据库错误日志
        /// </summary>
        /// <param name="msg"></param>
        /// <param name="e"></param>
        public static void Data(string msg, Exception e)
        {
            if (logedata.IsErrorEnabled)
                logedata.Error(msg, e);
        }
    }
}