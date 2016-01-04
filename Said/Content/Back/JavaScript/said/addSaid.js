'use strict';
define(['jquery', 'so'], function ($, so) {
    //得到文件后缀表达式
    var fileExttension = /\.[^\.]+/i,
        imgMaxSize = 1048576,//图片文件允许的最大大小，1mb
        Upload = function (elem, action, filters, callback, fail, maxSize) {
            //(要建立upload对象的元素/id,要上传的路径,过滤文件,上传成功后执行的回调函数,初始化给定的默认值)
            if (!(this instanceof Upload))
                return new Upload(elem, action, filters, callback, fail, maxSize);
            if (typeof fail === 'number')
                maxSize = maxSize;
            maxSize = maxSize || imgMaxSize;
            elem = so(elem);
            var that = this,
                item = that.element = elem[0],
                complex = item.tagName === 'INPUT' ? false : true,
                lock = false,
                progress = that.progress = complex ? item.getElementsByClassName('progress-bar')[0] : false,
                changeState = function (value) {
                    progress.style.width = value + '%';
                };
            that.input = complex ? item.getElementsByTagName('input')[0] : item;
            that.value = '';
            that.input.addEventListener('click', function (e) {
                if (lock)//如果拦截没有效果则使用：e.preventDefault();
                    return false;
            });
            that.input.addEventListener('change', function (e) {
                lock = true;
                var self = that,
                    file = this.files[0],
                    name = file.name,
                    size = file.size,
                    type = file.type || '',
                    ext = name.lastIndexOf('.'),//文件后缀，找到索引
                    //根据最后修改日期标志文件上传
                    id = (file.lastModifiedDate + "").replace(/\W/g, '') + size + type.replace(/\W/g, ''),
                    xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                    data = new FormData();
                if (ext !== -1)
                    ext = name.substring(ext + 1).toLowerCase();
                //尝试后缀名验证，如果后缀名验证则尝试使用文件MIME验证
                if (ext === -1 || (filters.indexOf(ext) === -1 && type !== '' && filters.indexOf(type) === -1)) {
                    fail && fail.call(self, { code: 2, msg: '<p>上传的文件不是可以接受的文件类型</p><p>可接受类型：</p>' + filters.join(',') }, file);
                    return;
                }
                if (size > maxSize) {
                    fail && fail.call(self, { code: 1, msg: '上传的文件超过了约定的最大大小（>' + Math.floor(maxSize / 1024 / 1024) + 'MB）' }, file);
                    return;
                }


                //验证合法性

                data.append('name', encodeURIComponent(name));
                data.append('fileId', id);
                /*
                    参考：http://javascript.ruanyifeng.com/bom/ajax.html#toc1
                    formData对象append方法很碉堡...
                */
                data.append('saidFile', file.slice(0), encodeURIComponent(name));//

                xhr.open('post', action, true);

                //xhr.setRequestHeader("Content-Disposition", 'Content-Disposition: form-data; name="img"; filename="blob"');
                if (complex)
                    xhr.upload.addEventListener("progress", function (e) {
                        //上传中
                        changeState(e.loaded / size * 100);
                    }, false);
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                self.value = data;
                                item.style.display = 'none';
                                callback && callback.call(self, data, 0);
                            } catch (e) {
                                //这是什么Error
                                fail && fail.call(self, { code: 3, msg: '服务器返回的并不是可解析的结果' }, data);
                            }
                            //上传完成
                        } else {
                            fail && fail.call(self, { code: 4, msg: '服务器返回异常' }, xhr);
                        }
                        lock = false;
                        if (complex)
                            changeState(0);
                    }
                };
                xhr.send(data);
            });
        };
    so.extend(Upload.prototype, {
        changeState: function (value) {

        },
        toggle: function (isHide) {
            this.element.style.display = isHide == true ? 'none' : '';
        }
    });
    var database = new so.DataBase('back.addSaid');//本地数据库
    var previewTemplent = ['<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>预览Said - 你听，你静静听</title><link href="/Content/Style/Global.css" rel="stylesheet" /><link href="/Content/Style/music.css" rel="stylesheet" /><link href="/Content/Back/JavaScript/syntaxhighlighter/styles/shCoreDefault.css" rel="stylesheet" /><script src="/Content/Back/JavaScript/syntaxhighlighter/scripts/shCore.js"></script><script src="/Content/Back/JavaScript/syntaxhighlighter/scripts/shBrushJScript.js"></script><script src="/Content/Back/JavaScript/syntaxhighlighter/scripts/shBrushCSharp.js"></script><script src="/Content/Back/JavaScript/syntaxhighlighter/scripts/shBrushCss.js"></script><script src="/Content/Back/JavaScript/syntaxhighlighter/scripts/shBrushSql.js"></script></head><body><section id="said-page"><header id="header"><div id="nav-logo"><a class="logo" title="听说" href="javascript:;"><img src="/Content/Images/Said.png" alt="said logo" /></a></div><nav id="nav"><ul id="nav-flip"><li><a href="javascript:;">首页</a></li><li><a href="javascript:;">blog</a></li><li><a href="javascript:;" class="nav-active">听说</a></li><li><a href="javascript:;">实验室</a></li><li><a href="javascript:;">关于</a></li></ul><div id="said-search-con" style="width: 50px;"><div id="said-search"><div id="said-search-btn" title="搜索"></div><form id="said-search-form"><input autocomplete="off" id="said-search-input" type="text" placeholder="搜索你感兴趣的" /></form></div></div><span id="nav-hover" style="left: 140px;"></span></nav></header><section id="content"><div class="content-bg"><div class="content-bg-img" style="left: 0;"></div></div><section class="music-song"><dl class="music-song-content"><dt class="music-song-img"><img src="/Content/Images/testImg-Paramore.Ps.jpg" alt="paramore" /></dt><dd class="music-song-info"><ul><li><h2 class="music-song-name">The Only Exception The Only Exception The Only Exception</h2></li><li><div class="music-song-summary"><a title="Artist" class="music-song-link" target="_blank" href="http://www.sogou.com/web?query=paramore&ie=utf8">Paramore</a></div><div class="music-song-summary"><a title="Album" class="music-song-link" target="_blank" href="http://www.sogou.com/web?query=The+Only+Exception&ie=utf8">The Only Exception</a></div></li></ul></dd><dd id="music-play" class="music-song-play"><div class="music-play-status"><a href="javascript:;" id="said-player-play" class="play-btn player-play">播放</a><a href="javascript:;" class="play-btn palyer-pause" id="said-player-pause" style="display: none;">暂停</a></div><ul class="music-play-status"><li class="music-play-detail"><div class="music-time music-play-sound"><span>01:03</span><span>&nbsp;/&nbsp;03:42</span></div><a class="music-like music-play-sound" href="javascript:;" title="我喜欢~么么哒">like</a><a class="music-volume music-play-sound" href="javascript:;" title="音量" id="said-play-volume"></a></li><li><div class="music-play-progress"><div class="play-progress" id="said-progress" style="width: 28%;"></div></div></li></ul></dd></dl></section><article class="music-content"><h1 class="blog-title" id="title"></h1><section class="blog-content" id="context"></section></article><section class="blog-more-info"><div class="blog-more-head"><div class="blog-comment-txt"><span>评论(0)</span></div><ul class="blog-info"><li class="blog-info-date"><time>2014/10/08 00:21:51</time></li><li class="blog-info-like" title="like"><span>1</span></li><li class="blog-info-PV" title="浏览"><span>1</span></li></ul></div><div class="blog-more-comment"><div class="blog-comment-content"><div class="blog-comment-bar"><div class="comment-portrait"><img alt="github" src="/Content/Images/github.png" /></div><form action="/" class="comment-form"><ul class="blog-comment-info" style=""><li><input placeholder="名称" /></li><li><input type="email" placeholder="Email" /></li><li><input type="url" placeholder="您的站点" /></li><li><input type="checkbox" id="comment-cookie" /><label for="comment-cookie">下次自动填写</label></li></ul><div class="comment-bar"><textarea name="comment" class="cmt-context" id="comment-context" placeholder="名称和Email（不会公开）必填，保存信息会保存这些信息，下次自动填充"></textarea><div class="comment-more-bar"><div class="comment-more-bg"></div><input type="submit" class="submitLock ct-submit" id="comment-submit" value="提交评论" /></div></div></form></div></div></div></section></section></section><footer id="footer"><section id="footer-content"><dl><dt>推荐</dt><dd><ul class="footer-recm"><li><a href="javascript:;">博客园 - 开发者的网上家园</a></li><li><a href="javascript:;">张鑫旭的个人博客</a></li><li><a href="javascript:;">司徒正美个人博客 - 博客园</a></li><li><a href="javascript:;">Github - linkFly</a></li></ul></dd></dl><dl><dt>许可</dt><dd>本站原创并且没有注明相关许可协议的内容，默认均采用<a href="javascript:;">《知识共享署名 3.0 中国大陆许可协议》</a>进行许可。非原创内容遵循原文许可协议。</dd></dl><dl><dt>联系方式</dt><dd>内容基本都是自己原创的，引用的地方都会给出相关引用，如有疏漏，联系方式：</dd><dd>linkFly6#live.com（#替换成@）</dd></dl><div class="footer-copyright">                ©2015&nbsp;linkFly&nbsp;-&nbsp;Said:听说&nbsp;&nbsp;京ICP备13014059号</div></section></footer><script type="text/javascript">     \
    document.title = "预览Said -" + window.said.title;        \
    document.getElementById("title").innerHTML = window.said.title;        \
    document.getElementById("context").innerHTML = window.said.context;        \
    SyntaxHighlighter.defaults["toolbar"] = false;        \
    SyntaxHighlighter.defaults["collapse"] = false;        \
    SyntaxHighlighter.all();</script></body></html>'],
        preview = function () {
            var previewWindow,//上一次打开的window
                    isSupport = true,//是否支持弹窗
                    supportError = function () {
                        if (!isSupport)
                            dialog('不支持该项操作', '<p>您的浏览器阻止了弹窗操作。</p><p>因为用户设置或者某些安全策略，浏览器或许会阻止弹窗操作。</p>');
                        return isSupport;
                    };
            return function (title, context) {
                if (!supportError()) return false;
                if (!previewWindow || previewWindow.closed)
                    previewWindow = window.open();
                if (!previewWindow) {//没有权限弹窗
                    isSupport = false;
                    return supportError();
                }
                if (!title) {
                    title = '标题为空';
                }
                if (!context)
                    context = '文章正文为空';
                /*
                document.write只能输出到body，但HTML标签可以输出，但是输出没用，样式js都不解析执行..
                所以访问window给它设置值来执行
                */

                previewWindow.document.open();
                previewWindow.said = {
                    title: title.replace(/</g, '').replace(/>/g, ''),//标题
                    context: context//正文
                };
                previewWindow.document.write(previewTemplent);
                previewWindow.document.close();
                return true;
            }
        }();
    return {
        Upload: Upload,
        ajax: function (data, action, done, fail) {
            //data是FormData对象
            var xhr = new XMLHttpRequest();
            xhr.open('post', action);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        done(JSON.parse(xhr.responseText), xhr);
                    } else {
                        //提交失败
                        fail(xhr);
                    }
                }
            }
            xhr.send(data);
        },
        DataBase: database,
        Preview: preview
    };

    //$('._menuHover').each(function (i) {
    //    var elem = $(this), radix = 80;
    //    elem.mouseover(function () {

    //    });
    //});
});

