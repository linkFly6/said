using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    public class EmailHelper
    {
        public static void SendEmail(string fromEmailAddress, string fromEmailDisplayName, string fromEmailPwd, string toEmailAddress, string emailTitle, string emailBody)
        {
            // 发件人
            MailAddress from = new MailAddress(fromEmailAddress, fromEmailDisplayName, Encoding.UTF8);

            // 收件人
            MailAddress to = new MailAddress(toEmailAddress);

            // 邮件消息类
            MailMessage message = new MailMessage(from, to);
            // 邮件标题
            message.Subject = emailTitle;
            message.SubjectEncoding = Encoding.UTF8;
            // 邮件正文
            message.Body = emailBody;
            message.BodyEncoding = Encoding.UTF8;

            // 确认为 HTML
            message.IsBodyHtml = true;

            // 邮件优先级
            // message.Priority = MailPriority.High;


            // 邮件客户端 ，参见这里：https://msdn.microsoft.com/zh-cn/library/system.net.mail.smtpclient.aspx
            // 如果一个账户需要发多个邮件的话不应该释放 client，因为开启一个 TLS 会话开销很大
            SmtpClient client = new SmtpClient("smtp.qq.com", 587);
            client.EnableSsl = true;
            // 同步调用 client.send 超时时间
            client.Timeout = 10000;

            client.Credentials = new NetworkCredential(fromEmailAddress, fromEmailPwd);

            try
            {
                client.Send(message);
            }
            catch (SmtpException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                message.Dispose();
                client.Dispose();
            }
        }

        // 群发邮件方法


    }
}
