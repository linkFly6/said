import { checkUri, format, escapeHTML, checkEmail } from './utils'
import { IReplyInfo, IComment, IReplyUserInfo } from './model'
import { dateFormat } from './format'

/**
<div class="item">
  <div class="head">
    <a class="hash" href="#1" title="定位到该评论" name="#1">
      <i class="saidfont icon-yinyong"></i>
    </a>
    <a class="link" href="/link?url=" target="_blank"><i class="saidfont icon-admin"></i>[管理员]linkFly</a>
    <span class="reply-txt">回复</span>
    <span>小白</span>
  </div>
  <div class="body">\${context}</div>
  <div class="footer">
    <span>#1</span>
    <span class="reply">
      <a href="javascript:;">
        <i class="saidfont icon-reply">回复</i>
      </a>
    </span>
    <span class="delete">
      <a href="javascript:;">删除</a>
    </span>
    <time>2014/10/08 00:21:51&nbsp;·&nbsp;</time>
  </div>
</div>
*/
/**
 * 评论模板
 */
const commentTemplate = `<div class="item">
<div class="head">
  <a class="hash" href="#\${hashname}" title="定位到该评论" name="#1">
    <i class="saidfont icon-yinyong"></i>
  </a>
  \${headHTML}
</div>
<div class="body">\${context}</div>
<div class="footer">
  <span>#\${hashname}</span>
  <span class="reply">
    <a href="javascript:;">
      <i class="saidfont icon-reply" data-commentid="\${commentId}" data-replyid="\${replyId}">回复</i>
    </a>
  </span>
  \${deleteHTML}
  <time>\${localDate}&nbsp;·&nbsp;</time>
</div>
</div>`


class Comment {
  public blogId: string
  public nickname: string
  public email: string
  public site: string

  /**
   * 是否正在提交数据
   */
  public submiting = false

  /**
   * 被回复的回复
   */
  public replyId?: string
  /**
   * 被回复的评论
   */
  public commentId?: string

  /**
   * 元素容器
   */
  public $element: JQuery
  public $name: JQuery
  public $email: JQuery
  public $site: JQuery
  public $context: JQuery
  public $submit: JQuery
  /**
   * 错误消息 DOM
   */
  public $msg: JQuery

  constructor(element: Element, blogId: string, nickname: string, email: string, site?: string) {
    this.$element = $(element)
    // 名称
    this.$name = this.$element.find('.form-name')
    // email
    this.$email = this.$element.find('.form-email')
    // 站点
    this.$site = this.$element.find('.form-site')
    // 内容
    this.$context = this.$element.find('.form-context')
    this.$msg = this.$element.find('.err-msg')
    this.blogId = blogId

    this.setData({
      nickname,
      email,
      site,
    })

    this.$submit = this.$element.find('.submit')
    // 提交评论
    this.$submit.on('click', () => {
      const data = {
        nickname: $.trim(this.$name.val()),
        email: $.trim(this.$email.val()),
        site: $.trim(this.$site.val()),
        context: $.trim(this.$context.val())
      }
      const errorMsg = this.check(data)
      if (errorMsg) {
        this.message(errorMsg)
        return
      }
      this.submit({
        blogId: this.blogId,
        commentId: this.commentId,
        replyId: this.replyId,
        ...data
      })
    })
  }

  /**
   * 触发事件
   * @param events 
   * @param data 
   */
  private emit(events: string, data: any) {
    this.$element.trigger(events, data)
    return this
  }

  /**
   * 监听触发的事件，有如下事件：
   * said.submit - 提交数据到服务器并返回了数据
   * @param events 
   * @param handler 
   */
  public on(events: 'said.submit', handler: (eventObject: JQueryEventObject, ...args: any[]) => any) {
    this.$element.on(events, handler)
    return this
  }


  /**
   * 显示错误消息
   * @param message 
   */
  public message(message: string) {
    this.$msg.text(message)
    return this
  }

  /**
   * 基础数据
   */
  public setData(data: { nickname: string, email: string, site?: string }) {
    this.message('')
    this.$email.val(data.email)
    this.$name.val(data.nickname)
    this.$site.val(data.site || '')
    return this
  }

  /**
   * 清空评论框中的数据
   */
  public clear() {
    this.$context.val('')
    this.message('')
    return this
  }

  /**
   * 设置评论 ID
   */
  public setReply(commentId: string, replyId?: string) {
    this.commentId = commentId
    this.replyId = replyId
  }

  /**
   * 检查表单项
   * @param data 
   */
  public check(data: IComment) {
    if (!data.nickname) {
      return '昵称不能为空'
    }
    if (data.nickname.length > 30) {
      return '昵称不允许超过 30 个字符'
    }

    if (!data.email) {
      return 'email 不能为空'
    }
    if (data.email.length > 60) {
      return 'email 不允许超过 60 个字符'
    }
    if (!checkEmail(data.email)) {
      return 'email 格式不正确'
    }
    if (data.site && !checkUri(data.site)) {
      return '站点信息不正确'
    }

    if (!data.context) {
      return '评论内容不能为空'
    }
    if (data.context.length > 30) {
      return '评论内容不允许超过 140 个字符'
    }
  }

  /**
   * 提交数据
   */
  public submit(
    data: {
      blogId: string
      commentId?: string
      replyId?: string
    } & IComment) {
    if (this.submiting) return
    this.submiting = true
    this.$submit.addClass('disabled').text('正在提交')
    $.ajax({
      url: '/blog/comment',
      type: 'post',
      dataType: 'json',
      data: data,
    }).done(data => {
      if (data.code === 0) {
        this.emit('said.submit', data.data)
      } else {
        this.message(data.message)
      }
    }).fail(err => {
      this.message('网络异常，提交信息失败')
      // @TODO 打 log
    }).always(() => {
      this.submiting = false
      this.$submit.removeClass('disabled').text('发布评论')
    })
    return this
  }


  /**
   * 渲染评论内容
   */
  render(data: IReplyInfo, hashname: string) {
    const headHTMLs = []
    let deleteHTML = ''
    /**
     * 管理员
     */
    if (data.user.role === 1) {
      headHTMLs.push(this._getUserHTML(data.user))
      deleteHTML = `<span class="delete"><a href="javascript:;" data-commentid="${data.commentId}">删除</a></span>`
    }
    /**
     * 针对回复的回复
     */
    if (data.reply && data.reply.replyId) {
      headHTMLs.push('<span class="reply-txt">回复</span>', this._getUserHTML(data.reply.user))
    }
    return format(commentTemplate, {
      hashname,
      commentId: data.commentId,
      replyId: data.replyId || '',
      context: data.context,
      headHTML: headHTMLs.join(''),
      deleteHTML,
      localDate: data.localDate,
    })
  }

  /**
   * 根据用户对象获取对应应该渲染的 HTML
   * @param user 
   */
  private _getUserHTML(user: IReplyUserInfo) {
    const currentTemplate =
      user.site ?
        `<a class="link" href="/link?url=${encodeURIComponent(user.site)}" target="_blank">\${0}</a>`
        : `<span>\${0}</span>`
    return format(currentTemplate,
      user.role === 1 ?
        `<i class="saidfont icon-admin"></i>[管理员]${escapeHTML(user.nickname)}` :
        escapeHTML(user.nickname)
    )
  }

}


/**
 * 用户评论
 */
export const registerUserCommentEvent = (blogId: string, nickName: string, email: string, site?: string) => {
  // 评论列表容器
  const $commentList = $('#comment-list')

  // 评论框，用于评论文章
  const $commentBar = $('.comment-bar')
  // clone 一份，用于回复评论
  const $replyBar = $commentBar.clone()
  // 计算 hash
  let hashIndex = $commentList.find('item').length

  // 从服务器返回的数据初始化
  const comment = new Comment($commentBar[0], blogId, nickName, email, site)
  const reply = new Comment($replyBar[0], blogId, nickName, email, site)

  /**
   * 评论成功事件
   */
  comment.on('said.submit', (e, data: IReplyInfo) => {
    const html = comment.render(data, ++hashIndex as any)
    $commentList.append(html)
    comment.clear()
  })

  // 绑定用户点击评论事件
  $commentList.on('click', '.reply-btn', function () {
    const $me = $(this)
    const commentId = $me.data('commentid')
    reply.setReply(commentId)
    $me.closest('.item').append(reply.$element)
  })

  reply.on('said.submit', (e, data: IReplyInfo) => {
    // 父级评论(.item) 的楼层
    const commentIndex = reply.$element.parent().index() + 1
    // .replys-box
    const $prev = reply.$element.prev()
    // 当前评论下的回复，最大楼层
    let replyIndex = $prev.find('.item').length
    const html = comment.render(data, `${commentIndex}-${++replyIndex}`)
    $prev.append(html)
    reply.clear()
  })
}

