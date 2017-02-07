using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Security.AntiXss;

namespace Said.Common
{
    /// <summary>
    /// Email 操作类
    /// </summary>
    public class EmailCommon
    {
        /// <summary>
        /// 配置的发件人邮箱
        /// </summary>
        private static string emailFromAddress = WebConfigurationManager.AppSettings["emailFromAddress"].ToString();
        /// <summary>
        /// 配置的发件人密码
        /// </summary>
        private static string emailFromPwd = WebConfigurationManager.AppSettings["emailFromPwd"].ToString();
        /// <summary>
        /// 配置的发件人昵称
        /// </summary>
        private static string emailFromDisplayName = WebConfigurationManager.AppSettings["emailFromDisplayName"].ToString();

        /// <summary>
        /// 发件 SMTP 服务器
        /// </summary>
        private static string emailSmtpServerHost = WebConfigurationManager.AppSettings["emailSmtpServerHost"].ToString();
        /// <summary>
        /// 发件 SMTP 服务器端口
        /// </summary>
        private static int emailSmtpServerPort = int.Parse(WebConfigurationManager.AppSettings["emailSmtpServerPort"]);


        /// <summary>
        /// 配置的回复模板地址
        /// </summary>
        private static string emailFromReplyTemplatePath = WebConfigurationManager.AppSettings["emailFromReplyTemplatePath"].ToString();

        private static readonly ILog logManager = LogManager.GetLogger(typeof(EmailCommon));


        /// <summary>
        /// 发送一封回复邮件
        /// </summary>
        /// <param name="toEmailAddress">收件人</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文</param>
        /// <param name="nickName">收件人昵称</param>
        /// <param name="titleLink">邮件模板中的标题链接</param>
        /// <param name="title">邮件模板中的文章标题</param>
        /// <param name="moreLink">邮件模板中的查看更多</param>
        /// <returns></returns>
        public static bool SendReplyEmail(string toEmailAddress, string emailTitle, string emailBody, string nickName, string titleLink, string title, string moreLink)
        {

            string emailHTML = FileCommon.ReadToString(HttpContext.Current.Server.MapPath(emailFromReplyTemplatePath));
            string emailContent = emailHTML.Replace("{nickName}", AntiXssEncoder.HtmlEncode(nickName, false)).Replace("{titleLink}", titleLink).Replace("{title}", title).Replace("{body}", AntiXssEncoder.HtmlEncode(emailBody, false)).Replace("{moreLink}", moreLink);
            try
            {
                Mailer.SendEmail(emailSmtpServerHost, emailSmtpServerPort, emailFromAddress, emailFromAddress, emailFromPwd, toEmailAddress, emailTitle, emailContent, 100);
                return true;
            }
            catch (Exception e)
            {
                logManager.Error(string.Format("发送邮件异常{2}【收件人】{0}{2}【邮件正文】{2}{1}", toEmailAddress, emailContent, Environment.NewLine), e);
                return false;
            }
        }
    }

    public enum EmailTemplateName
    {
        Reply = 0
    }
}