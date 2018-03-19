import { checkUri } from './utils'

/**
 * 用户评论
 */
export const registerUserCommitEvent = (blogId: string) => {
  // 评论列表容器
  const $commentBox = $('#comment-list')

  // 评论框，有两个评论框，一个是评论，另外一个是针对评论的回复
  const $commentBar = $('.comment-bar')

  // 提交评论
  $commentBar.each((i, elem) => {
    const $element = $(elem)
    // 名称
    const $name = $element.find('.form-name')
    // email
    const $email = $element.find('.form-email')
    // 站点
    const $site = $element.find('.form-site')
    // 内容
    const $context = $element.find('.form-context')

    // 单击 "发布评论"/"回复"
    $element.find('.button').on('click', () => {
      const data = {
        name: $.trim($name.val()),
        email: $.trim($email.val()),
        site: $.trim($site.val()),
        context: $.trim($context.val())
      }
      const errorMsg = check(data)
      if (errorMsg) {
        // @TODO 在页面中显示错误信息
        return
      }
      $.ajax({
        url: '/blog/comment',
        type: 'post',
        dataType: 'json',
        data: data,
      }).done(function (data) {
        // @TODO 在页面中对应位置插入
      }).fail(function (err) {
        // @TODO 在页面中显示错误信息
      })
    })
  })
}

// @TODO 应该设计个对象模型，因为评论和回复对象


const check = (data: {
  name: string,
  email: string,
  site?: string,
  context: string
}) => {
  if (!data.name) {
    return '昵称不能为空'
  }
  if (data.name.length > 30) {
    return '昵称不允许超过 30 个字符'
  }

  if (!data.email) {
    return 'email 不能为空'
  }
  if (data.email.length > 60) {
    return 'email 不允许超过 60 个字符'
  }

  if (data.site && checkUri(data.site)) {
    return '站点信息不正确'
  }

  if (!data.context) {
    return '评论内容不能为空'
  }
  if (data.context.length > 30) {
    return '评论内容不允许超过 140 个字符'
  }
}