using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Said.Common
{
    /// <summary>
    /// 发件对象
    /// </summary>
    public class Mailer : IDisposable
    {

        /// <summary>
        /// 发件人邮箱
        /// </summary>
        public string FromEmailAddress { get; set; }

        /// <summary>
        /// 发件人邮箱密码
        /// </summary>
        private string FromEmailPassword { get; set; }

        /// <summary>
        /// 发件人信息
        /// </summary>
        private MailAddress from;
        /// <summary>
        /// 发件人信息
        /// </summary>
        public MailAddress From
        {
            get { return from; }
        }

        /// <summary>
        /// 发件客户端
        /// </summary>
        private SmtpClient client;
        /// <summary>
        /// 发件客户端
        /// </summary>
        public SmtpClient Client
        {
            get { return client; }
        }


        /// <summary>
        /// 初始化一个发件对象，使用 Smtp 协议发送邮件
        /// </summary>
        /// <param name="host">smtp服务器</param>
        /// <param name="port">smtp发件端口</param>
        /// <param name="fromEmailAddress">发件人邮箱地址</param>
        /// <param name="fromEmailDisplayName">发件人显示的昵称</param>
        /// <param name="fromEmailPwd">发件人密码</param>
        public Mailer(string host, int port, string fromEmailAddress, string fromEmailDisplayName, string fromEmailPwd)
        {
            // 发件人
            this.from = new MailAddress(fromEmailAddress, fromEmailDisplayName);
            // 发件端
            this.client = new SmtpClient(host, port);
            this.client.EnableSsl = true;
            this.FromEmailPassword = fromEmailPwd;
        }


        /// <summary>
        /// 设置邮件发送信息
        /// </summary>
        /// <param name="toEmailAddress">收件人邮箱</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文（HTML格式）</param>
        private MailMessage SetMessageInfo(string toEmailAddress, string emailTitle, string emailBody)
        {
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
            // HTML 格式
            message.IsBodyHtml = true;

            // 延迟连接发件服务器
            if (client.Credentials == null)
            {
                client.Credentials = new NetworkCredential(FromEmailAddress, FromEmailPassword);
            }
            return message;
        }

        /// <summary>
        /// 同步发邮件
        /// </summary>
        /// <param name="toEmailAddress">收件人邮箱</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文（HTML格式）</param>
        /// <param name="timeout">超时时间（ms）</param>
        public void Send(string toEmailAddress, string emailTitle, string emailBody, int timeout)
        {
            client.Timeout = timeout;
            client.Send(SetMessageInfo(toEmailAddress, emailTitle, emailBody));
        }

        /// <summary>
        /// 同步发邮件（默认6s超时）
        /// </summary>
        /// <param name="toEmailAddress">收件人邮箱</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文（HTML格式）</param>
        public void Send(string toEmailAddress, string emailTitle, string emailBody)
        {
            client.Timeout = 60000;
            client.Send(SetMessageInfo(toEmailAddress, emailTitle, emailBody));
        }

        // TODO 这里有异步的问题，但并没有处理
        ///// <summary>
        ///// 异步发邮件
        ///// </summary>
        ///// <param name="toEmailAddress">收件人邮箱</param>
        ///// <param name="emailTitle">邮件标题</param>
        ///// <param name="emailBody">邮件正文（HTML格式）</param>
        ///// <param name="timeout">超时时间（ms）</param>
        //public void SendAsync(string toEmailAddress, string emailTitle, string emailBody, int timeout)
        //{
        //    client.Timeout = timeout;
        //    MailMessage message = SetMessageInfo(toEmailAddress, emailTitle, emailBody);
        //    client.SendAsync()
        //}


        /// <summary>
        /// 异步发邮件
        /// </summary>
        /// <param name="host">smtp服务器</param>
        /// <param name="port">smtp端口</param>
        /// <param name="fromEmailAddress">发件人</param>
        /// <param name="fromEmailDisplayName">发件人昵称</param>
        /// <param name="fromEmailPwd">发件人密码</param>
        /// <param name="toEmailAddress">收件人</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文（HTML）</param>
        /// <param name="timeout">超时时间</param>
        /// <param name="callback">回调函数</param>
        public async static void SendEmailAsync(string host, int port, string fromEmailAddress, string fromEmailDisplayName, string fromEmailPwd, string toEmailAddress, string emailTitle, string emailBody, int timeout, SendCompletedEventHandler callback)
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
            using (SmtpClient client = new SmtpClient("smtp.qq.com", 587))
            {
                client.EnableSsl = true;
                // 同步调用 client.send 超时时间
                client.Timeout = 6000;

                client.Credentials = new NetworkCredential(fromEmailAddress, fromEmailPwd);


                client.SendCompleted += callback;

                try
                {
                    await client.SendMailAsync(message);
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
                }
            }


        }


        /// <summary>
        /// 同步发邮件
        /// </summary>
        /// <param name="host">smtp服务器</param>
        /// <param name="port">smtp端口</param>
        /// <param name="fromEmailAddress">发件人</param>
        /// <param name="fromEmailDisplayName">发件人昵称</param>
        /// <param name="fromEmailPwd">发件人密码</param>
        /// <param name="toEmailAddress">收件人</param>
        /// <param name="emailTitle">邮件标题</param>
        /// <param name="emailBody">邮件正文（HTML）</param>
        /// <param name="timeout">超时时间</param>
        public static void SendEmail(string host, int port, string fromEmailAddress, string fromEmailDisplayName, string fromEmailPwd, string toEmailAddress, string emailTitle, string emailBody, int timeout)
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
            using (SmtpClient client = new SmtpClient("smtp.qq.com", 587))
            {
                client.EnableSsl = true;
                // 同步调用 client.send 超时时间
                client.Timeout = 6000;

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
                }
            }


        }

        public void Dispose()
        {
            if (this.client != null)
            {
                this.client.Dispose();
            }
        }
    }
}
