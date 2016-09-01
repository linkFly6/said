define('blog.edit', ['said', 'jquery', 'so', 'avalon', 'sweetalert', 'source', 'showdown', 'highlight', /*'showDownThemeGithub',*/ 'groupInput', 'avalonUpload'], function (said, $, so, avalon, sweetalert, source, showdown, highlight) {
    var TemplatePromptText = {
        errorBTitle: ['（￣工￣lll） 文章标题不正确', '你忘记填写文章标题了... '],
        errorBContext: ['(｡☉౪ ⊙｡)  文章正文不正确', '大哥你连正文都木有发表了文章谁看啊...赶紧检查一下  '],
        errorBSummary: [' (￣▽￣)~* 文章描述不正确', '文章描述是一定要有的，没有文章描述诱惑，别人也许就不会读文章了'],
        errorClasify: [' (｡・`ω´･) 文章分类不正确', '是的，为了以后让你的文章特别特别特别方便的管理/检索，一定要有文章的分类']
    };
    return function (blogId, _classifydbData, Action, DataCenter) {

        $(function () {
            document.addEventListener('keydown', function (e) {
                if (e.ctrlKey && e.keyCode == 83) {
                    e.preventDefault();
                }
            });

            var converter = new showdown.Converter({ /*extensions: ['github'],*/
                omitExtraWLInCodeBlocks: false,//配置生成的code是否最后生成一个\n
                //noHeaderId: true//是否禁用h1-h7生成id
                prefixHeaderId: 'bt-',//设置h1-h7的的id（会进行自增，默认为title，第二个为title1）

                /*
                    启用从降级语法中设置图像尺寸
                    ![foo](foo.jpg =100x80)     100*80px
                    ![bar](bar.jpg =100x*)      设置height为"auto"
                    ![baz](baz.jpg =80%x5em)    width=80%,height=5em
                */
                parseImgDimensions: true,
                /*
                    是否自动转换站点
                    www.said.com => <a href="www.said.com">www.said.com</a>
                */
                //simplifiedAutoLink: false,

                /*
                    支持删除线
                    ~~said~~  => <del>said</del>
                */
                strikethrough: true,

                /*
                    支持表格
                    | h1    |    h2   |      h3 |
                    |:------|:-------:|--------:|
                    | 100   | [a][1]  | ![b][2] |
                    | *foo* | **bar** | ~~baz~~ |
                */
                tables: true,

                //tablesHeaderId: true,//为表格的表格头设置一个表格ID

                //smoothLivePreview: true//防止在实时预览输入中，由于不完整输入造成显示起来怪异的影响

                //smartIndentationFix: true//（尝试修复）当涉及到ES6模板字符串中缩进代码的格式

            }),//页面markdown转换器=>来自showDown.js
                getContextHTML = function (context) {
                    //先使用markdown解析为HTML
                    var html = converter.makeHtml(context);
                    //再使用highlight高亮代码，highlightInHTML()这个方法是自己写的
                    var temp = highlight.highlightInHTML(html);
                    console.log(temp);
                    return temp;
                },
                preview = function (title, context, classify, tags) {
                    context = getContextHTML(context);
                    var htmls = [
                        '<textarea name="BTitle">' + title + '</textarea>',
                        '<textarea name="BHTML">' + encodeURIComponent(context) + '</textarea>',
                        '<textarea name="ClassifyId">' + classify + '</textarea>',
                        tags.map(function (tag) {
                            return '<input name="BTag" value="' + tag.name + '"/>';
                        }).join('')
                    ].join('');
                    //TODO img的refer应该处理下
                    //链接也应该做转发处理

                    //context = context.replace(/<pre[^>]*>.*(<code[^>]*>)?[^<]*(<\/code>)?<\/pre>/gm, function (sourceCode) {
                    //    //console.log(highlight.highlightAuto(sourceCode));
                    //    return highlight.highlightAuto(sourceCode).value;
                    //});

                    //console.log(highlight.highlightAuto(context));
                    //return;

                    var $form = $('<form target="_blank" method="post" action="' + Action.preview + '" style="display:none;"></form>');
                    $form.append(htmls);
                    $form.submit();
                },
                database = new so.Database('back.editBlog'),
                checkEmptyValue = function (key, title, summary) {
                    if (!vmBlog[key]) {
                        sweetalert(title, summary, 'warning');
                        return false;
                    }
                    return true;
                },
                errorHash = {
                    'bTitle': TemplatePromptText.errorBTitle,
                    'bContext': TemplatePromptText.errorBContext,
                    'bSummary': TemplatePromptText.errorBSummary,
                    'classify': TemplatePromptText.errorClasify
                },
                encode = function (value) {
                    return encodeURIComponent(value);
                };


            var vmBlog = avalon.define({
                $id: 'blog',
                bTitle: '',
                bTag: DataCenter.blogTags,
                bSummary: '',
                bReprint: '',
                bScript: '',
                bIsTop: '',
                bCSS: '',
                bContext: '',
                bName: '',
                classifyId: '',
                classify: '',
                checkFile: false,
                submitState: false,
                $skipArray: ['bTag', 'classify'],
                reset: function () {
                    window.location.href = '/Back/Blog';
                },
                //预览
                preview: function (markdownCode) {
                    if (!vmBlog.bTitle.trim()) {
                        sweetalert('预览信息不完整', '标题不能为空', 'info');
                        return;
                    }
                    if (!vmBlog.bContext.trim()) {
                        sweetalert('预览信息不完整', '正文不能为空', 'info');
                        return;
                    }
                    if (!vmBlog.classifyId) {
                        sweetalert('预览信息不完整', '类别不能为空', 'info');
                        return;
                    }
                    if (!vmBlog.bTag.length) {
                        sweetalert('预览信息不完整', '至少要有一个标签', 'info');
                        return;
                    }
                    preview(vmBlog.bTitle.trim(),
                        vmBlog.bContext,//进行HTML转换
                        vmBlog.classifyId,
                        vmBlog.bTag
                        );

                },
                checkFileName: function () {
                    //考虑性能，DOM缓存
                    var $cache, key = 'bName';
                    return function (elem, value) {
                        !$cache && ($cache = $(elem).tooltip({ trigger: 'manual' }));
                        vmBlog.checkFile = !!(value && ~DataCenter.files.indexOf(value.toLowerCase()));
                        $cache.tooltip(vmBlog.checkFile ? 'show' : 'hide');
                    }
                }(),
                check: function () {
                    vmBlog.submitState = true;
                    var temp;
                    return ['bTitle', 'bContext', 'classify', 'bSummary'].every(function (key) {
                        temp = errorHash[key];
                        return checkEmptyValue(key, temp[0], temp[1]);
                    });
                },
                save: function () {
                    //锁定按钮状态
                    if (vmBlog.submitState) return;
                    if (!(vmBlog.submitState = vmBlog.check())) return;

                    var bSummaryTrim = vmBlog.bSummary.split('\n').map(function (item) {
                        return '<p>' + item + '</p>';
                    }).join('');

                    said.ajax(Action.form, {
                        'BlogId': blogId,
                        'BTitle': encode(vmBlog.bTitle),
                        'Tags': vmBlog.bTag.length ? encode(JSON.stringify(vmBlog.bTag.map(function (tag) {
                            if (tag.name == tag.data) {
                                return {
                                    TagId: null,
                                    TagName: tag.name
                                };
                            } else
                                return {
                                    TagId: tag.data,
                                    TagName: ''
                                };
                        }))) : null,
                        'BSummary': encode(vmBlog.bSummary),
                        'BHTML': encodeURIComponent(getContextHTML(vmBlog.bContext)),
                        'BReprint': encode(vmBlog.bReprint),
                        'BSummaryTrim': encode(bSummaryTrim),
                        'BScript': encode(vmBlog.bScript),
                        'BIsTop': encode(vmBlog.bIsTop),
                        'BCSS': encode(vmBlog.bCSS),
                        'BContext': encode(vmBlog.bContext),
                        'BName': encode(vmBlog.bName),
                        'ClassifyId': encode(vmBlog.classifyId)
                    }).done(function (data) {
                        if (!data.code) {//done
                            sweetalert({
                                title: '修改成功',
                                text: so.format('喜大普奔，修改Blog《${0}》成功', vmBlog.bTitle),
                                type: "success",
                                //当sweetalert回调函数中需要再弹出一个sweetalert的时候，要设置这个属性
                                closeOnConfirm: false
                            }, function () {
                                vmBlog.reset();
                            });


                        } else {
                            sweetalert({
                                title: '修改失败',
                                text: so.format('服务器返回信息（错误代码 ${1}）：${0}', data.data.msg.split(',').map(function (msg) {
                                    return '<p>' + msg + '</p>';
                                }).join(''), data.code),
                                html: true,
                                type: 'error'
                            });
                        }

                    }).fail(function (data) {
                        sweetalert('修改(提交)异常', so.format('异常代码：${0}（${1}）', data.status, data.statusText), 'warning');
                    }).always(function () {
                        vmBlog.submitState = false;
                    });
                }
            });



            //vmBlog.$watch('$all', function () {
            //    console.log(arguments);
            //});

            //tag
            avalon.define({
                $id: 'tagController',
                //tags: DataCenter.tags,
                groupInput: {
                    datas: DataCenter.tags,
                    multiple: true,
                    zIndex: 5,
                    callback: function (values) {
                        //console.log(values);
                        vmBlog.bTag = values;//[ {"name":"ES","query":"ES","data":"tagID"} ]
                    },
                    values: vmBlog.bTag
                }
            });
            //classify
            if (_classifydbData) {
                vmBlog.classifyId = _classifydbData.data;
                vmBlog.classify = _classifydbData.name;
            }
            avalon.define({
                $id: 'classifyController',
                groupInput: {
                    datas: DataCenter.classifyDatas,
                    zIndex: 4,
                    custom: false,
                    callback: function (value) {
                        vmBlog.classifyId = value.data;
                        vmBlog.classify = value.name;
                    },
                    values: _classifydbData ? [_classifydbData.data] : null
                }
            });
            avalon.scan();
            //还原要编辑的数据
            ["bTitle", "bSummary", "bContext", "bName", "bScript", "bCSS", "bScript", "bIsTop", "bReprint"].forEach(function (propertiePrefixName) {
                var elem = vmBlog.elem[propertiePrefixName + '-h'];
                if (elem && elem.value.length)
                    vmBlog[propertiePrefixName] = (propertiePrefixName == 'bReprint' || propertiePrefixName == 'bIsTop') ? elem.value === 'True' ? true : false : elem.value;
            });
        });
    }
});