using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace Said.Common
{
    public class SaidCommon
    {

        /// <summary>
        /// 创建一个对象ID（新增对象的时候）  * 该API会逐渐私有化，请使用SaidCommon.GUID *
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
        /// 获取时间戳  
        /// </summary>  
        /// <returns></returns>  
        public static string GetTimeStamp()
        {
            TimeSpan ts = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0);
            return Convert.ToInt64(ts.TotalMilliseconds).ToString();
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
        /// 将时间转换为本地文本（2016-01-01 => 昨天 22:00）
        /// </summary>
        /// <returns></returns>
        public static string DateToLocalOrDay(DateTime date)
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
            return date.ToString("yyyy-MM-dd");
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

        /// <summary>
        /// 进行事务操作，当代码出现异常的时候，则会回滚事务（事务的异常会被抛出）
        /// </summary>
        /// <param name="func">要进行事务操作的回调函数</param>
        public static void Transaction(Action func)
        {
            using (TransactionScope scope = new TransactionScope())
            {
                try
                {
                    func();
                    scope.Complete();
                }
                catch (Exception e)
                {
                    throw e;
                }
                finally
                {
                    scope.Dispose();
                }
            }
        }


        /// <summary>
        /// 进行事务操作，当代码出现异常的时候，则会回滚事务（事务的异常会被抛出），该参数的重载了事务的返回值
        /// </summary>
        /// <typeparam name="TResult">指定的返回类型</typeparam>
        /// <param name="func">要进行事务操作的回调函数</param>
        /// <returns></returns>
        public static TResult Transaction<TResult>(Func<TResult> func)
        {
            using (TransactionScope scope = new TransactionScope())
            {
                try
                {
                    TResult result = func();
                    scope.Complete();
                    return result;
                }
                catch (Exception e)
                {
                    throw e;
                }
                finally
                {
                    scope.Dispose();
                }
            }
        }
    }
}
