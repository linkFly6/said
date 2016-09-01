define('home.config', ['jquery', 'so', 'avalon', 'sweetalert', 'dialog', 'bsTable', 'source', 'bs-date'], function ($, so, avalon, sweetalert, dialog) {

    var database = so.Database('back.pageConfig'),
        //缩略图模型
        model = {
            Theme: '',//主题
            SourceCode: '',//滚动图文本源码/HTML
            HTML: '',//转换后的文本/HTML
            Link: '',//链接
            Description: '',//描述
            ImageId: ''
        };

    return function (PageDatas, Action, Source, globalTheme) {
        $(function () {
            var vmPage = avalon.define({
                $id: 'vmPage',
                ThemeText: globalTheme[database.val('Theme') || 0],
                Theme: database.val('Theme') || 0,

                selectTheme: function (index) {
                    vmPage.ThemeText = globalTheme[index];
                    vmPage.Theme = index;
                    database.val('Theme', index);
                },
                //textarea模型
                SourceCode: database.val('SourceCode') || '',//HTML
                HTML: '',//转换后的文本
                changeModelHTML: function (html) {
                    if (/</.test(html)) {//如果检测到了HTML，则使用HTML模式 TODO提升准确性，例如<<test>>这样的
                        vmPage.HTML = html;
                    } else {
                        //否则默认文本处理
                        var texts = html.split('\n');
                        vmPage.HTML = texts.map(function (text) {
                            return '<p>' + text + '</p>';
                        }).join('');
                    }
                },
                isShowForm: database.val('isShowForm'),
                toggleShowStatus: function (isShowForm) {
                    vmPage.isShowForm = isShowForm;
                    database.val('isShowForm', isShowForm);
                },


                //选择图片
                selectImagePath: database.val('selectImagePath'),
                selectImageObject: database.val('selectImageObject'),
                showImagesBox: function () {
                    _ImageDialog.show();
                },

                Description: database.val('Description') || '',
                Link: database.val('Link') || '',

                lock: false,
                submit: function () {
                    if (vmPage.lock) return;
                    //尽可能多保存数据
                    database.val('Description', vmPage.Description);
                    if (!vmPage.Link.trim()) {
                        sweetalert('输入不正确', '请输入正确的链接', 'warning');
                        return;
                    }
                    database.val('Link', vmPage.Link);
                    if (!vmPage.HTML.trim()) {
                        sweetalert('输入不正确', '请输入正确的文本', 'warning');
                        return;
                    }
                    database.val('SourceCode', vmPage.SourceCode);
                    if (vmPage.selectImageObject == null) {
                        sweetalert('输入不正确', '请选择一张赏心悦目的背景图', 'warning');
                        return;
                    }
                    database.val('selectImagePath', vmPage.selectImagePath);
                    database.val('selectImageObject', vmPage.selectImageObject);
                    vmPage.lock = true;
                    var data = so.extend({}, model);
                    so.each(model, function (key, value) {
                        //vm.$model挂在着vm对象的原型，只是读取不经过双向监听处理，性能更加
                        data[key] = encodeURIComponent(vmPage.$model[key] || '');
                    });
                    data['ImageId'] = vmPage.selectImageObject['ImageId'];
                    window.said.ajax(Action.AddBanner, data)
                        .done(function (result) {
                            if (result.code === 0) {
                                database.clear();
                                vmPage.reset();
                                $btTable.bootstrapTable('insertRow', [result.data]);
                            } else {
                                sweetalert('服务器新增Banner异常', result.msg, 'error');
                            }
                            vmPage.lock = false;
                        })
                        .fail(function () {
                            sweetalert('网络连接异常', result.msg, 'error');
                        })
                        .always(function () {
                            vmPage.lock = false;
                        });
                },
                reset: function () {
                    vmPage.Description = vmPage.HTML = vmPage.SourceCode = vmPage.Link = '';
                    vmPage.ThemeText = globalTheme[0];
                    vmPage.Theme = 0;
                    vmPage.isShowForm = false;
                    vmPage.lock = false;
                },
                remove: function (id, callback) {
                    if (!id) return;
                    $.ajax(Action.RemoveBanner, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ id: id })
                    })
                    .done(function (result) {
                        if (result.code === 0) {
                            $btTable.bootstrapTable('remove', {
                                field: 'BannerId',
                                values: [id]
                            });
                            sweetalert('操作成功', '删除Banner成功', 'success');
                        } else {
                            sweetalert('服务器返回异常', result.msg, 'error');
                        }
                    })
                    .fail(function () {
                        sweetalert('操作异常', '网络连接异常', 'error');
                    })
                    .always(callback);
                },
                $skipArray: ['selectImageObject']
            });

            if (vmPage.SourceCode) {
                vmPage.changeModelHTML(vmPage.SourceCode);
            }

            avalon.scan();
            //获取与国际通用UTC时间的分钟差（北京 = -480m = 8h）
            var timezoneOffset = new Date().getTimezoneOffset();//datatimepicker组件使用的国际通用UTC时间，和北京时间相差8个小时，所以要修正时间差，获取
            var dateInput = $(vmPage.elem.queryDate).datetimepicker({
                minView: 'month',//bootstrap-datetimepicker:#1677
                endDate: new Date
            }).on('changeDate', function (e) {
                var selectDate = so.parseDate(e.date.getTime());//因为要修正时间，但是不能直接修改组件内置对象的时间，所以copy一个副本
                //修正UTC时间（分钟）差
                selectDate.setMinutes(timezoneOffset);
                //重置时间到23:59:59
                selectDate.setHours(23, 59, 59, 0);
                var data = PageDatas.filter(function (data) {
                    return so.parseDate(data.Date).getTime() <= selectDate.getTime();
                });
                $btTable.bootstrapTable('load', data);
            });


            //初始化图片选择框
            var _ImageDialog = $.source({
                loadUrl: Action.GetImagesList,//'/Back/Source/GetImagesList'
                path: Source.image,
                type: Source.imageType,
                uploadUrl: Action.uploadImage,
                deleteUrl: Action.realDeleteImage,
                multiple: false,
                size: Source.maxSize,
                //deleteUrl: Action.deleteImage, //这个是逻辑删除，上线用这个
                callback: function (data) {
                    if (data) {
                        vmPage.selectImagePath = Source.image + data.IFileName;
                        vmPage.selectImageObject = data;
                    } else {
                        vmPage.selectImagePath = '';
                        vmPage.selectImageObject = null;
                    }
                }
            });



            var $btTable = $('#btTable').bootstrapTable({
                columns: [
                 { field: 'BannerId', title: 'ID', visible: false, },
                 {
                     field: 'Date',
                     title: '日&#12288;&#12288;期',
                     valign: 'middle',
                     sortable: true,
                     formatter: function (value, row, index) {
                         //console.log(row); //row可以访问到数据
                         //return ['<a target="_black" href="', Action.article, '">', value, '</a>'].join('');
                         return [so.dateFormat(value, 'yyyy-MM-dd HH:mm')].join('');
                     }
                 },
                 {
                     field: 'Theme',
                     title: '主&#12288;&#12288;题',
                     valign: 'middle',
                     sortable: true,
                     formatter: function (value, row, index) {
                         return globalTheme[value];
                     }
                 },
                 {
                     field: 'SourceCode',
                     title: '文&#12288;&#12288;本',
                     valign: 'middle',
                     formatter: function (value) {
                         return so.escapeHTML(value);
                     }
                 },
                  {
                      field: 'Link',
                      title: '链&#12288;&#12288;接',
                      valign: 'middle'
                  },
                 {
                     field: 'Description',
                     title: '描&#12288;&#12288;述',
                     valign: 'middle'
                 },
                 {
                     field: 'SaidId',
                     title: '操&#12288;&#12288;作',
                     formatter: function (value, row, index) {
                         return ['<a href="javascript:;" title="删除" class="btn btn-danger fa fa-trash-o data-delete" data-id="', row.BannerId, '" data-index="', index, '"></a>'].join('');
                     }
                 }],
                data: PageDatas
            }).on('click', '.data-delete', function (e) {
                var data = this.dataset, $this = $(this);
                dialog('您确定要删除该Bannner么？').on(function () {
                    $this.attr('disabled', 'disabled').html('删除中');
                    vmPage.remove(data.id, function () {
                        $this.length && $this.removeAttr('disabled');
                    });
                }).show();
            });
        })
    }

});