$(document).ready(function () {
  // Place JavaScript code here...
  var CommentInput: any = function (blogId: any, $commentBox: any) {
    //添加到全局数组中，并拿到自己的索引
    this.index = CommentInput.push(this)
    this.isLock = false
    this.blogId = blogId
    this.commentId = null//通用化，针对评论的回复ID
    this.replyId = null//通用化，针对回复的回复ID
    this.$commentBox = $commentBox
    this.$nickName = $commentBox.find('[name="nickName"]')
    this.$email = $commentBox.find('[name="email"]')
    this.$site = $commentBox.find('[name="site"]')
    this.$remember = $commentBox.find('[name="remember"]')
    this.$context = $commentBox.find('[name="context"]')
    this.$submit = $commentBox.find('[name="submit"]')
    this.$loading = $commentBox.find('._loading')
    this.$msg = $commentBox.find('._errMsg')

    var me = this;
    [this.$nickName, this.$email, this.$site, this.$context].forEach(function ($elem) {
      $elem.on('input', function () {
        me.msg(null)
      })
    })
    this._initEvent()
  }

  CommentInput.lists = []

  CommentInput.checkNickName = function (name: any) {
    return name && name.length <= 20
  }
  CommentInput.checkEmail = function (email: any) {
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
    return email.length <= 60 && reg.test(email)
  }
  CommentInput.checkSite = function (site: any) {
    var reg = /^((https|http)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/
    if (site == '') return true
    return site.length <= 60 && reg.test(site)
  }
  CommentInput.checkContext = function (context: any) {
    return context.length > 1 && context.length <= 140
  }

  //全局数组，添加返回对应的索引
  CommentInput.push = function (commentInput: any) {
    return CommentInput.lists.push(commentInput) - 1
  }

  //进行批量更新状态
  CommentInput.update = function (index: any, nickName: any, site: any, email: any, remember: any) {
    CommentInput.lists.forEach(function (item: any, i: any) {
      if (index === i) return
      item.$nickName.val(nickName)
      item.$email.val(email)
      item.$site.val(site)
      item.$remember.prop('checked', remember)
    })
  }

  //全局更新状态
  CommentInput.prototype.update = function () {
    CommentInput.update(this.index, this.$nickName.val().trim(), this.$site.val().trim(), this.$email.val().trim(), this.$remember.prop('checked'))
    return this
  }

  //初始化事件
  CommentInput.prototype._initEvent = function () {
    var me = this
    this.$submit.on('click', function () {
      me.commit(me.commentId, me.replyId)
    })
    this.$remember.on('change', function () {
      me.update()
    })
    this.$context.on('keydown', function (e: any) {
      if (e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        me.$submit.trigger('click')
      }
    })
    return this
  }

  //锁住表单提交
  CommentInput.prototype.lock = function (isLock: any) {
    this.isLock = !!isLock
    return this
  }

  CommentInput.prototype.check = function () {
    if (!CommentInput.checkNickName(this.$nickName.val().trim())) {
      this.$nickName.focus()
      this.msg('昵称不正确，不允许为空和超过20个字符')
      return false
    }
    if (!CommentInput.checkEmail(this.$email.val().trim())) {
      this.$email.focus()
      this.msg('Email格式不正确，不允许超过60个字符')
      return false
    }
    if (!CommentInput.checkSite(this.$site.val().trim())) {
      this.$site.focus()
      this.msg('用户站点不正确，不允许携带参数，并且不允许超过60个字符')
      return false
    }
    if (!CommentInput.checkContext(this.$context.val().trim())) {
      this.$context.focus()
      this.msg('评论内容不正确，要求不超过140个字符')
      return false
    }
    return true
  }

  //显示正在加载样式
  CommentInput.prototype.loading = function (isLoading: any) {
    if (isLoading == true) {
      this.$msg.hide()
      this.$loading.show()
    } else {
      this.$loading.hide()
    }
    return this
  }

  //显示消息
  CommentInput.prototype.msg = function (message: any) {
    if (message == null) {
      this.$msg.hide()
      return this
    }
    this.$msg.text(message).show()
    this.$loading.hide()
    return this
  }

  //监听事件
  CommentInput.prototype.on = function (name: any, func: any) {
    this.$commentBox.on(name, func)
    return this
  }

  //提交数据
  CommentInput.prototype.commit = function (commentId: any, replyId: any) {
    var me = this
    //每尝试提交一次，则进行一次全局更新
    me.update()
    me.msg(null)
    if (!me.check()) return

    //这里先声明要保存到cookie的属性
    var data = {
      nickName: this.$nickName.val().trim(),
      site: this.$site.val().trim(),
      email: this.$email.val().trim(),
    }
    //对site格式进行修正
    // if (data.site) data.site = CommonComments.resolveSite(data.site)
    me.lock(true).loading(true)
    if (commentId) {

    }
    if (replyId) {

    }



    $.ajax({
      url: commentId || replyId ? '/blog/reply' : '/blog/comment',
      type: 'post',
      dataType: 'json',
    }).done(function (result) {
      if (result.code !== 0) {
        me.msg(result.msg)
        me.$commentBox.trigger('said.commitFail', result, data)
        return
      }

      if (me.$remember.prop('checked')) {

        me.$commentBox.trigger('said.rememberCookie')
      } else {

      }
      me.$commentBox.trigger('said.commitOK', [result, data])
      //清空掉
      me.$context.val('')
    }).fail(function (xhr) {
      me.$commentBox.trigger('said.commitError', xhr, data)
    }).always(function () {
      me.lock(false).loading(false)
    })
    return this
  }

})