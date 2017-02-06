using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Common
{
    /// <summary>
    /// Email 操作类
    /// </summary>
    public class EmailCommon
    {
        private static string emailFromAddress = System.Web.Configuration.WebConfigurationManager.AppSettings["emailFromAddress"].ToString();
        private static string emailFromPwd = System.Web.Configuration.WebConfigurationManager.AppSettings["emailFromPwd"].ToString();
        private static string emailFromDisplayName = System.Web.Configuration.WebConfigurationManager.AppSettings["emailFromDisplayName"].ToString();
        private static string emailFromReplyTemplatePath = System.Web.Configuration.WebConfigurationManager.AppSettings["emailFromReplyTemplatePath"].ToString();

        private static readonly ILog logManager = LogManager.GetLogger(typeof(EmailCommon));

        public static bool TestSendEmail()
        {
            try
            {
                string emailBody = FileCommon.ReadToString(HttpContext.Current.Server.MapPath(emailFromReplyTemplatePath));
                EmailHelper.SendEmail(emailFromAddress, emailFromDisplayName, emailFromPwd, "silin6@vip.qq.com", "Said 发来的问候", emailBody);
                return true;
            }
            catch (Exception e)
            {
                logManager.Error("发送 Email 异常", e);
                return false;
            }

        }
    }
}