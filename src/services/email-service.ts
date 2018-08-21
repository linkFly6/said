
import * as nodemailer from 'nodemailer'
import { Log } from '../utils/log'
import * as pug from 'pug'
import * as path from 'path'

const log = new Log('service/email')

const replyTemplate = pug.compileFile(path.resolve(__dirname, '../views/templates/reply-email.pug'))


export interface IAddress {
  /**
   * 收件人邮箱，多个使用 , 号分隔
   */
  to: string
  /**
   * 邮件 title
   */
  subject: string
  /**
   * 数据
   */
  data: {
    /**
     * 用户昵称
     */
    nickname: string
    /**
     * 文章标题
     */
    title: string
    /**
     * 文章链接
     */
    titleHref: string
    /**
     * 回复正文
     */
    body: string
    /**
     * 点击查看详情跳转的评论地址
     */
    moreHref: string
  }
}

/**
 * 使用 nodemailer 发邮件，nodemailer 文档
 * https://nodemailer.com/about/
 */
let transporter: nodemailer.Transporter

/**
 * 发邮件
 */
export const sendReplyEmail = (address: IAddress) => {
  if (transporter == null) {
    transporter = nodemailer.createTransport({
      /**
       * 采用连接池链接，节省资源
       */
      pool: true as any,
      /**
       * qq 邮箱配置文档
       * http://service.mail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=331
       */
      host: 'smtp.qq.com',
      port: 587,
      // secure: true,
      auth: {
        user: process.env.QQSMTP_USER,
        pass: process.env.QQSMTP_PASS,
      }
    })
  }
  const html = replyTemplate(address.data)
  log.info('sendEmail.ready', {
    address,
    html
  })
  let mailOptions = {
    /**
     * 发件人，email 必须和 user 一致
     */
    from: `Said <${process.env.QQSMTP_USER}>`, // sender address
    /**
     * 收件人，多个人使用 , 号分割
     * mailer@nodemailer.com, Mailer <mailer2@nodemailer.com>
     */
    to: address.to, // list of receivers
    /**
     * 标题
     */
    subject: address.subject, // Subject line
    /**
     * 邮件正文
     */
    html,   // html body
  }
  /**
   * 发送邮件
   */
  transporter.sendMail(mailOptions).then(messageInfo => {
    log.info('sendEmail.success', messageInfo)
  }).catch(err => {
    log.error('sendEmail.error', err)
  })
}