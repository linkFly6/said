using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said
{
    /// <summary>
    /// Said全局帮助类
    /// </summary>
    public class SaidCommon
    {
        /// <summary>
        /// 创建一个对象ID（新增对象的时候）
        /// </summary>
        /// <returns></returns>
        public static string CreateId()
        {
            return Guid.NewGuid().ToString().Replace("-", "");
        }

        /// <summary>
        /// 获取一个符合Said要求的GUID（剔除"-"号），作为新增对象使用，每次获取都会生成
        /// </summary>
        public static string GUID
        {
            get { return CreateId(); }
        }


        /// <summary>
        /// 将时间转换为本地文本（2016-01-01 22:31:54 => 昨天 22:00）
        /// </summary>
        /// <returns></returns>
        public static string DateToLocal(DateTime date)
        {
            DateTime now = DateTime.Now;
            TimeSpan timespan = now - date;
            if (timespan.TotalSeconds < 60)
            {
                return "刚才";
            }
            if (timespan.TotalDays < 1 && now.Day == date.Day)
            {
                return date.ToString("今天 HH:mm");
            }
            if (timespan.TotalDays < 2 && now.Day - date.Day == 1)
            {
                return date.ToString("昨天 HH:mm");
            }
            if (timespan.TotalDays < 3 && now.Day - date.Day == 2)
            {
                return date.ToString("前天 HH:mm");
            }
            return date.ToString("yyyy-MM-dd HH:mm");
        }


        /// <summary>
        /// 将时间转换为本地星期
        /// </summary>
        /// <returns></returns>
        public static string DateToLocalWeek(DateTime date)
        {
            switch (date.DayOfWeek)
            {
                case DayOfWeek.Friday:
                    return "星期五";
                case DayOfWeek.Monday:
                    return "星期一";
                case DayOfWeek.Saturday:
                    return "星期六";
                case DayOfWeek.Sunday:
                    return "星期天";
                case DayOfWeek.Thursday:
                    return "星期四";
                case DayOfWeek.Tuesday:
                    return "星期二";
                case DayOfWeek.Wednesday:
                    return "星期三";
            }
            return string.Empty;
        }


        static DateTime FixedkDate = new DateTime(2016, 1, 1, 0, 0, 0);
        /// <summary>
        /// 转换秒数到时间
        /// </summary>
        /// <param name="duration"></param>
        public static string ConverDuration(int duration)
        {
            return FixedkDate.AddSeconds(duration).ToString("mm:ss");
        }


    }
}