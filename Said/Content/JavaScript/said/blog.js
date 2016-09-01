define(['jquery', 'so'], function ($, _) {
    'use strict';
    var commentsTemplate = '<li class="comment-item"><div class="ctitem-content _comment"><div class="ct-top"><a href="#${anthor}" name="${anthor}" title="锚点引用" class ="anchor"><i class ="fa fa-link"></i></a>${title}</div><div class="ct-context"><p>${context}</p></div><div class="ct-footer"><span class="ct-num">#${anthor}</span>${deleteHTML}<time class="ct-time">${date}</time>${replyHTML}</div><div class="comment-reply" style="display:none"><div class="arrow-border cr-arrow"></div><ul class="cr-container"></ul></div></div></li>';
    //var replyTemplte = `<li class="cr-item">
    //                                                                <div class="cr-content">
    //                                                                    <div class="ct-top">
    //                                                                        <a href="#${parentAnthor}-${anthor}" name="${parentAnthor}-${anthor}" title="锚点引用" class ="anchor"><i class ="fa fa-link"></i></a>
    //                                                                        ${title}
    //                                                                    <p class="cr-context wordbreak">${context}</p>
    //                                                                    <div class ="cr-footer">
    //                                                                        ${deleteHTML}
    //                                                                        <time class="ct-time">${date}</time>
    //                                                                        <a href="javascript:;" class="ct-reply _reply2reply" data-comment-id="${commentId}" data-reply-id="${replyId}">回复</a>
    //                                                                    </div>
    //                                                                </div>
    //                                                            </li>`;
    var replyTemplte = '<li class="cr-item"><div class="cr-content"><div class="ct-top"><a href="#${parentAnthor}-${anthor}" name="${parentAnthor}-${anthor}" title="锚点引用" class ="anchor"><i class ="fa fa-link"></i></a>${title}<p class="cr-context wordbreak">${context}</p><div class ="cr-footer">${deleteHTML}<time class="ct-time">${date}</time>${replyHTML}</div></div></li>';

    //本地缓存数据
    var cookieData = _.cookie('u') || null,
        blogRemember = _.cookie('b-re'),//下次是否自动填写
        disabledString = 'disabled';//抗压缩
    //第一次访问，cookie没有数据，默认为记住密码
    if (blogRemember == '') {
        blogRemember = true;
    }

    //将表单评论抽象出对象
    var CommentInput = function (blogId, $commentBox) {
        //添加到全局数组中，并拿到自己的索引
        this.index = CommentInput.push(this);
        this.isLock = false;
        this.blogId = blogId;
        this.commentId = null;//通用化，针对评论的回复ID
        this.replyId = null;//通用化，针对回复的回复ID
        this.$commentBox = $commentBox;
        this.$nickName = $commentBox.find('[name="nickName"]');
        this.$email = $commentBox.find('[name="email"]');
        this.$site = $commentBox.find('[name="site"]');
        this.$remember = $commentBox.find('[name="remember"]');
        this.$context = $commentBox.find('[name="context"]');
        this.$submit = $commentBox.find('[name="submit"]');
        this.$loading = $commentBox.find('._loading');
        this.$msg = $commentBox.find('._errMsg');
        this.$remember.prop('checked', !!blogRemember);
        if (cookieData) {
            this.$nickName.val(cookieData.nickName);
            this.$email.val(cookieData.email);
            this.$site.val(cookieData.site);
            //进行全局状态更新
            this.update();
        }

        var me = this;
        [this.$nickName, this.$email, this.$site, this.$context].forEach(function ($elem) {
            $elem.on('input', function () {
                me.msg(null);
            });
        });
        this._initEvent();
    };

    CommentInput.lists = [];

    CommentInput.checkNickName = function (name) {
        return name && name.length <= 20;
    };
    CommentInput.checkEmail = function (email) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
        return email.length <= 60 && reg.test(email);
    };
    CommentInput.checkSite = function (site) {
        var reg = /^((https|http)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/;
        if (site == '') return true;
        return site.length <= 60 && reg.test(site);
    };
    CommentInput.checkContext = function (context) {
        return context.length > 1 && context.length <= 140;
    }

    //全局数组，添加返回对应的索引
    CommentInput.push = function (commentInput) {
        return CommentInput.lists.push(commentInput) - 1;
    }

    //进行批量更新状态
    CommentInput.update = function (index, nickName, site, email, remember) {
        CommentInput.lists.forEach(function (item, i) {
            if (index === i) return;
            item.$nickName.val(nickName);
            item.$email.val(email);
            item.$site.val(site);
            item.$remember.prop('checked', remember);
        })
    }

    //全局更新状态
    CommentInput.prototype.update = function () {
        CommentInput.update(this.index, this.$nickName.val().trim(), this.$site.val().trim(), this.$email.val().trim(), this.$remember.prop('checked'));
        return this;
    }

    //初始化事件
    CommentInput.prototype._initEvent = function () {
        var me = this;
        this.$submit.on('click', function () {
            me.commit(me.commentId, me.replyId);
        });
        this.$remember.on('change', function () {
            blogRemember = me.$remember.prop('checked');
            me.$commentBox.trigger('said.rememberChange', blogRemember);
            me.update();
            _.cookie('b-re', blogRemember);
        });
        this.$context.on('keydown', function (e) {
            if (e.ctrlKey && e.keyCode == 13) {
                e.preventDefault();
                me.$submit.trigger('click');
            }
        });
        return this;
    }

    //锁住表单提交
    CommentInput.prototype.lock = function (isLock) {
        if (isLock == true) {
            this.$nickName.attr(disabledString, disabledString);
            this.$site.attr(disabledString, disabledString);
            this.$email.attr(disabledString, disabledString);
            this.$context.attr(disabledString, disabledString);
            this.$remember.attr(disabledString, disabledString);
            this.$submit.attr(disabledString, disabledString);
        } else {
            this.$nickName.removeAttr(disabledString);
            this.$site.removeAttr(disabledString);
            this.$email.removeAttr(disabledString);
            this.$context.removeAttr(disabledString);
            this.$remember.removeAttr(disabledString);
            this.$submit.removeAttr(disabledString);
        }
        this.isLock = !!isLock;
        return this;
    }

    CommentInput.prototype.check = function () {
        if (!CommentInput.checkNickName(this.$nickName.val().trim())) {
            this.$nickName.focus();
            this.msg('昵称不正确，不允许为空和超过20个字符');
            return false;
        }
        if (!CommentInput.checkEmail(this.$email.val().trim())) {
            this.$email.focus();
            this.msg('Email格式不正确，不允许超过60个字符');
            return false;
        }
        if (!CommentInput.checkSite(this.$site.val().trim())) {
            this.$site.focus();
            this.msg('用户站点不正确，不允许携带参数，并且不允许超过60个字符');
            return false;
        }
        if (!CommentInput.checkContext(this.$context.val().trim())) {
            this.$context.focus();
            this.msg('评论内容不正确，要求不超过140个字符');
            return false;
        }
        return true;
    }

    //显示正在加载样式
    CommentInput.prototype.loading = function (isLoading) {
        if (isLoading == true) {
            this.$msg.hide();
            this.$loading.show();
        } else {
            this.$loading.hide();
        }
        return this;
    }

    //显示消息
    CommentInput.prototype.msg = function (message) {
        if (message == null) {
            this.$msg.hide();
            return this;
        }
        this.$msg.text(message).show();
        this.$loading.hide();
        return this;
    }

    //监听事件
    CommentInput.prototype.on = function (name, func) {
        this.$commentBox.on(name, func);
        return this;
    }

    //提交数据
    CommentInput.prototype.commit = function (commentId, replyId) {
        var me = this;
        //每尝试提交一次，则进行一次全局更新
        me.update();
        me.msg(null);
        if (!me.check()) return;

        //这里先声明要保存到cookie的属性
        var data = {
            nickName: this.$nickName.val().trim(),
            site: this.$site.val().trim(),
            email: this.$email.val().trim(),
        };
        //对site格式进行修正
        if (data.site) data.site = CommonComments.resolveSite(data.site);

        //然后进行mixin，让cookie的数据纯粹
        if (cookieData != null) {//如果cookie有数据
            _.extend(cookieData, data);
        } else {
            cookieData = _.extend({}, data);;
        }
        me.lock(true).loading(true);
        if (commentId) {
            data.commentId = commentId;
        }
        if (replyId) {
            data.replyId = replyId;
        }
        data.blogId = this.blogId;
        data.context = this.$context.val().trim();


        $.ajax({
            url: commentId || replyId ? '/blog/reply' : '/blog/comment',
            type: "post",
            dataType: "json",
            data: _.encode(data)
        }).done(function (result) {
            if (result.code !== 0) {
                me.msg(result.msg);
                me.$commentBox.trigger('said.commitFail', result, data);
                return;
            }
            //记住cookie
            if (me.$remember.prop('checked')) {
                _.cookie('u', cookieData);
                me.$commentBox.trigger('said.rememberCookie');
            } else {
                _.removeCookie('u');
            }
            me.$commentBox.trigger('said.commitOK', [result, data]);
            //清空掉
            me.$context.val('');
            cookieData.context = '';

        }).fail(function (xhr) {
            me.$commentBox.trigger('said.commitError', xhr, data);
        }).always(function () {
            me.lock(false).loading(false);
        });
        return this;
    }


    var CommonComments = {
        //删除评论
        deleteComments: function (commentId) {
            return $.ajax({
                url: '/blog/DeleteComment',
                type: "post",
                dataType: "json",
                data: { commentId: commentId }
            });
        },
        //渲染评论
        renderCommentHTML: function (commentId, nickName, site, context, isAdmin, anthor) {
            var titleHTMLs = ['<a href="#', anthor, '" name="', anthor, '" title="锚点引用" class="anchor"><i class="fa fa-link"></i></a>'];
            //var replyHTMLs = ['<a href="javascript:;" class ="ct-reply _reply" ${data}><i class ="fa fa-comments"></i>回复</a>'];
            if (isAdmin) {
                titleHTMLs.push('<a href="/" class="ct-name" target="_blank" title="管理员" data-admin="true">linkFly</a><i class="fa fa-user-secret admin" title="管理员"></i>');
            } else if (site) {
                titleHTMLs.push('<a title="访问Ta的站点" href="/Home/Cl?url=', encodeURIComponent(site), '&sgs=', encodeURIComponent('b-c-' + anthor), '" class="ct-name"  target="_blank">', so.escapeHTML(nickName), '</a>');
            } else {
                titleHTMLs.push('<span class="ct-name">', so.escapeHTML(nickName), '</span>');
            }

            //渲染的HTML
            var renderHTML = _.format(commentsTemplate, {
                anthor: anthor,
                title: titleHTMLs.join(''),
                context: _.escapeHTML(context),
                deleteHTML: isAdmin ? '<a href="javascript:;" class="delete _commentDelete" title="删除该评论（请谨慎操作）" data-comment-id="' + commentId + '" >删除</a>' : '',
                date: '刚才',
                commentId: commentId,
                //这里没必要显示回复按钮，因为用户不允许回复自己的回复
                //data: ['data-comment-id="', commentId, '" data-admin="', isAdmin, '" data-anthor="', anthor, '" data-site="', encodeURIComponent(site), '" data-nick-name="', so.escapeHTML(nickName), '"'].join(''),
                replyHTML: ''//replyHTMLs.join('')
            });
            return renderHTML;
        },
        //渲染回复
        renderReplyHTML: function (commentId, replyId, nickName, site, context, isAdmin, parentAnthor, anthor, toReplyId, toReplyNickName, toReplySite, toReplyIsAdmin) {
            var titleHTMLs = [];
            //var replyHTMLs = ['<a href="javascript:;" class="ct-reply _reply2reply" ${data}><i class="fa fa-comments-o" aria-hidden="true"></i>回复</a>'];
            if (isAdmin) {
                titleHTMLs.push('<a href="/" class="ct-name" target="_blank" title="管理员">linkFly</a><i class="fa fa-user-secret admin" title="管理员"></i>');
            } else if (site) {
                titleHTMLs.push('<a title="访问Ta的站点" href="/Home/Cl?url=', encodeURIComponent(site), '&sgs=b-c-', parentAnthor, '-', anthor, '" class="ct-name"  target="_blank">', so.escapeHTML(nickName), '</a>');
            } else {
                titleHTMLs.push('<span class="ct-name">', so.escapeHTML(nickName), '</span>');
            }
            if (toReplyId) {//针对回复的
                titleHTMLs.push('&nbsp;&nbsp;回复&nbsp;&nbsp;');
                if (toReplyIsAdmin) {
                    titleHTMLs.push('<a href="/" class="ct-name" target="_blank" title="管理员"  target="_blank">linkFly</a><i class="fa fa-user-secret admin" title="管理员"></i>');
                } else if (toReplySite) {
                    titleHTMLs.push('<a title="访问Ta的站点" href="/Home/Cl?url=', encodeURIComponent(toReplySite), '&sgs=b-c-to-', parentAnthor, '-', anthor, '" class="ct-name"  target="_blank">', so.escapeHTML(toReplyNickName), '</a>');
                } else {
                    titleHTMLs.push('<span class="ct-name">', so.escapeHTML(toReplyNickName), '</span>');
                }
            }
            //渲染的HTML
            var renderHTML = _.format(replyTemplte, {
                anthor: anthor,
                title: titleHTMLs.join(''),
                context: _.escapeHTML(context),
                deleteHTML: isAdmin ? '<a href="javascript:;" class="delete _commentDelete" title="删除该评论（请谨慎操作）" data-reply-id="' + replyId + '" >删除</a>' : '',
                commentId: commentId,
                date: '刚才',
                replyId: replyId,
                parentAnthor: parentAnthor,
                //data: ['data-comment-id="', commentId, '" data-reply-id="', replyId, '" data-admin="', isAdmin, '" data-parent-anthor="', parentAnthor, '" data-anthor="', anthor, '" data-site="', encodeURIComponent(site), '" data-nick-name="', so.escapeHTML(nickName), '"'].join(''),
                replyHTML: '' //replyHTMLs.join('')
            });
            return renderHTML;
        },
        //修正site的
        resolveSite: function (site) {
            if (~site.indexOf('//')) {
                return 'http:' + site;
            } else if (~site.indexOf('://')) {
                return 'http' + site;
            } else if (!/^http(?:s)?:\/\//.test(site)) {
                return 'http://' + site;
            } else
                return site;
        }
    };

    return function (blogId) {
        $(function () {
            //滚动菜单
            var $nav = $('#a-nav'),
                $main = $('#blog-main'),
                mainTop = $main.offset().top,
                windowHeight = window.innerHeight;
            $(window).on('scroll', function () {
                if (window.scrollY > mainTop) {
                    $nav.addClass('fixed');
                } else
                    $nav.removeClass('fixed');
            });

            var $commentContent = $('#comment-content'),//评论栏容器
                $commentForm = $('#comment-form');//评论表单
            $commentForm.on('submit', function (e) {
                return false;
            });


            //评论
            var commentInput = new CommentInput(blogId, $('#comment-form')),
                $commentList = $('#comment-list')//评论列表的容器=> ul
            commentInput.on('said.commitOK', function (e, result, data) {
                console.log(arguments);
                //评论成功，获取当前楼层
                var anthorNum = $commentList.children().length + 1,
                    html = CommonComments.renderCommentHTML(result.data.id, data.nickName, data.site, data.context, result.data.king, anthorNum);
                $commentList.append(html);
                //hash定位过去
                window.location.hash = '#' + anthorNum;
                //TODO 这里要把页面上那个大的【评论(个数)】也给修正下，删除评论的逻辑同理
            });

            //删除评论
            $commentList.on('click', '._commentDelete', function () {
                var $this = $(this);
                if ($this.data('lock') == true) return false;
                if (confirm('您确定删除该条评论么？该删除操作为逻辑删除。') && confirm('请再次确认是否删除该条评论，该删除操作为逻辑删除，可以在数据库恢复记录。')) {
                    //找到父容器，如果删除成功，则父容器会进行更新
                    var $box = $this.closest('li'),
                        commentId = $this.data('commentId');
                    $this.text('删除中');
                    //标记当前正在操作
                    $this.data('lock', true);
                    if (commentId) {
                        CommonComments.deleteComments(commentId).done(
                            function (data) {
                                //删除成功后要矫正所有删除楼层数据 => 评论个数、评论楼层
                                if (data.code != 0) {
                                    $this.text('删除');
                                    alert('删除失败，您没有权限');
                                } else {
                                    $this.removeData('lock');
                                    alert('删除成功');
                                    $box.remove();
                                }
                            }).fail(
                            function () {
                                alert('删除失败，网络异常');
                            });
                    }
                }
            });
            var cacheCommentData = {
                commentId: '',
                nickName: '',
                isComment: false,
                site: '',
                isAdmin: '',
                anthor: 0,
                inputShow: false,//回复的输入框是否已经显示
                toReply: null
            };
            var replyInput = new CommentInput(blogId, $('#reply-form')),
                hideOldInputBox = function () {
                    //已经在别的地方显示
                    if (cacheCommentData.inputShow) {
                        if (cacheCommentData.isComment) {//如果是在评论下面的回复
                            //如果回复列表里面有数据
                            if (replyInput.$commentBox.next().find('li').length > 0) {
                                replyInput.$commentBox.prev().removeClass('rc-arrow').addClass('cr-arrow');//只需要把箭头从左边移到中间即可
                            } else
                                replyInput.$commentBox.parent().hide();//回复列表没有数据，直接把父容器隐藏
                        } else {
                            //如果是在回复下面的回复
                            replyInput.$commentBox.closest('.comment-reply').children().eq(0).removeClass('rc-arrow').addClass('cr-arrow');
                        }

                    }
                };
            //针对评论的回复
            $commentList.on('click', '._reply', function () {
                if (replyInput.isLock) return false;//当前正在评论其他项，所以不做任何操作了
                var $this = $(this),
                    commentId = $this.data('commentId'),//获取评论ID
                    $replyBox = $this.parent().next();

                hideOldInputBox();

                //移动它 => jQuery.children会拿到所有的子元素，通过eq(0)可以拿到第一个子元素
                $replyBox.children().eq(0).after(replyInput.$commentBox).removeClass('cr-arrow').addClass('rc-arrow');
                if ($replyBox.is(':hidden')) {
                    $replyBox.show();
                }
                if (!cacheCommentData.inputShow) {//如果没有显示

                    replyInput.$commentBox.show();
                    cacheCommentData.inputShow = true;
                }
                //置入缓存
                cacheCommentData.commentId = commentId;
                cacheCommentData.anthor = $this.data('anthor');
                cacheCommentData.isComment = true;
                cacheCommentData.nickName = cacheCommentData.site = '';
                replyInput.replyId = null;//将针对回复的回复置空
            });

            //针对回复的回复
            $commentList.on('click', '._reply2reply', function () {
                if (replyInput.isLock) return false;//当前正在评论其他项，所以不做任何操作了
                var $this = $(this),
                    commentId = $this.data('commentId'),
                    replyId = $this.data('replyId');

                hideOldInputBox();

                //插入评论框
                $this.closest('.cr-content').after(replyInput.$commentBox).closest('.comment-reply').children().eq(0).removeClass('cr-arrow').addClass('rc-arrow');

                if (!cacheCommentData.inputShow) {//如果没有显示，则显示出来
                    replyInput.$commentBox.show();
                    cacheCommentData.inputShow = true;
                }


                //标记当前是针对回复的回复
                cacheCommentData.isComment = false;
                cacheCommentData.isAdmin = !!$this.data('admin');
                cacheCommentData.anthor = $this.data('parentAnthor');
                cacheCommentData.nickName = $this.data('nickName');
                cacheCommentData.site = $this.data('url');
                replyInput.replyId = replyId;

            });

            replyInput.on('said.commitOK', function (e, result, data) {
                //result={"code":0,"data":{"king":false,"cid":"196aa42e129a4940be76643080f10ffb","rid":"29de4a2970044972af8441af884ede71"}}
                if (cacheCommentData.isComment) {//如果是针对评论的回复
                    var $replyList = replyInput.$commentBox.next();
                    //防止xss注入，数据都去HTML中取
                    var anthorNum = $replyList.children().length + 1,
                        html = CommonComments.renderReplyHTML(
                            data.commentId,
                            result.rid,
                            data.nickName,
                            data.site,
                            data.context,
                            result.king,
                            cacheCommentData.anthor,
                            anthorNum
                        );
                    $replyList.append(html);
                    //window.location.hash = '#' + cacheCommentData.anthor + '-' + anthorNum;
                } else {
                    //如果是针对回复的回复，结构不同
                    var $replyList = replyInput.$commentBox.closest('.cr-container');
                    //
                    var anthorNum = $replyList.children().length + 1,
                        html = CommonComments.renderReplyHTML(
                         data.commentId,
                         result.id,
                         data.nickName,
                         data.site,
                         data.context,
                         result.king,
                         cacheCommentData.anthor,
                         anthorNum,
                         replyInput.replyId,
                         cacheCommentData.nickName,
                         cacheCommentData.site,
                         cacheCommentData.isAdmin
                        );
                    $replyList.append(html);
                }
                window.location.hash = '#' + cacheCommentData.anthor + '-' + anthorNum;
            })

        });
    }





})