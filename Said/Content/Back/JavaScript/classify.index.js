define('classify.index', ['so', 'jquery', 'avalon', 'sweetalert', 'upload', 'avalonUpload', 'popup', 'bsTable'], function (so, $, avalon, sweetalert) {


    //匹配中文、英文字母、数字和下划线（_）
    var regValue = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;

    /*
       TODO
       1、这个上传路径注意可以从站点全局路径对象中配置 TODO
       2、分类和标签，在编辑状态下，点击保存，得验证是否修改过，是否和未修改以前的值一样，如果是一样，直接显示修改成功，而不传递到后端了
     */

    var deleteDialog = function (templateHTML) {
        return new Promise(function (resolve, reject) {
            sweetalert({
                title: '确认删除',
                text: templateHTML,
                html: true,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: '确认删除',
                closeOnConfirm: false,
                cancelButtonText: '取消',

                //配置正在加载
                showLoaderOnConfirm: true
            }, function (isConfirm) {
                if (isConfirm) {
                    resolve();
                } else
                    reject();
            });
        });
    };


    return function (PageDatas, Action, PageConfig) {
        $(function () {
            'use strict';
            var vmClassify = avalon.define({
                $id: 'classify',
                modelId: '',
                modelRowIndex: 0,
                img: '',
                name: '',
                imgSource: Action.defualtImgUrl,
                defaultIcon: Action.defualtImgUrl + Action.defaultIcon,
                $skipArray: ['imgSource', 'defaultIcon'],
                addCallback: function (name, img) {
                    //验证是否合法
                    if (!regValue.test(name)) {
                        sweetalert('请输入正确的分类名称', '只允许中文、英文字母、数字以及下划线(_)', 'info')
                        return;
                    }
                    $.ajax(Action.urlAddClassify, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: encodeURIComponent(name), imgName: img })
                    }).done(function (server) {
                        if (server.code === 0) {
                            //分类添加成功
                            vmClassify.name = vmClassify.img = vmClassify.modelId = '';
                            $classifyTable.bootstrapTable('append', [{
                                CName: name,
                                CIcon: img,
                                ClassifyId: server.data
                            }]);
                            sweetalert({
                                title: '添加分类成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常：',
                                text: server.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                },
                editCallback: function (id, name, img) {
                    if (!regValue.test(name)) {
                        sweetalert('请输入正确的分类名称', '只允许中文、英文字母、数字以及下划线(_)', 'info')
                        return;
                    }
                    $.ajax(Action.urlEditClassify, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: encodeURIComponent(name), imgName: img, id: id })
                    }).done(function (result) {
                        if (result.code === 0) {
                            $classifyTable.bootstrapTable('updateRow', {
                                index: vmClassify.modelRowIndex,
                                row: {
                                    ClassifyId: id,
                                    CName: name,
                                    CIcon: img
                                }
                            });
                            vmClassify.name = vmClassify.img = vmClassify.modelId = '';
                            vmClassify.modelRowIndex = 0;
                            sweetalert({
                                title: '编辑分类成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常',
                                text: result.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                },
                add: function (name) {
                    var img = vmClassify.img || Action.defaultIcon,
                        name = name.trim();
                    if (!name.length) {
                        //sweetalert({
                        //    title: '请输入分类名称',
                        //    type: 'info'
                        //});
                        return vmClassify.elem.input.focus();
                    }
                    //ajax添加
                    vmClassify.modelId ? vmClassify.editCallback(vmClassify.modelId, name, img) : vmClassify.addCallback(name, img);

                },
                keydown: function (e) {
                    if (e.keyCode === 13)
                        vmClassify.add(vmClassify.name);
                },
                cancel: function (e) {
                    vmClassify.modelId = vmClassify.img = vmClassify.name = '';
                    vmClassify.modelRowIndex = 0;
                },
                popup: {
                    title: '  请选择或上传新的Icon',
                    context: $('#selectIcons'),
                    width: 450,
                    classIcon: 'fa fa-picture-o'
                },
                set: function (img, name, id, index) {
                    vmClassify.img = img;
                    vmClassify.name = name;
                    if (id) {
                        vmClassify.modelId = id;
                    }
                    if (index != null)
                        vmClassify.modelRowIndex = index;
                },
                del: function (id) {//delete
                    if (!id) return;
                    $.ajax(Action.urlDelClassify, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ id: id })
                    }).done(function (result) {
                        if (result.code === 0) {
                            $classifyTable.bootstrapTable('remove', {
                                field: 'ClassifyId',
                                values: [id + '']//bootStrapTable的bug，因为dataId是被jQuery转成了数字，导致bootStrapTable检测BlogId字段是否相等的时候发生了bug
                            });
                            sweetalert({
                                title: '删除分类成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常',
                                text: result.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                }
            });

            //上传
            var vmUpload = avalon.define({
                $id: 'iconBox',
                sourcePath: Action.defualtImgUrl,
                imgs: PageDatas.imgs,
                $uploadIconsConfig: {
                    text: '',
                    classFile: 'hidden-file',
                    size: PageConfig.iconMaxSize,
                    //name: 'testFile',
                    url: Action.uploadSourceUrl,
                    filters: ['jpg', 'jpeg', 'jpe', 'png', /*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],
                    visible: true,
                    done: function (vm, data) {
                        if (data.code === 0) {//上传成功
                            vmUpload.imgs.push(data.name);
                        } else {
                            sweetalert({
                                title: '上传Icon失败',
                                text: '服务器异常：' + data.msg,
                                type: 'error'
                            });
                        }
                        return true;
                    },
                    fail: function (vm, data) {
                        sweetalert({
                            title: '上传Icon失败',
                            text: data.msg,
                            type: 'warning'
                        });
                    },
                    //selected: function (file) {
                    //    console.log(file);
                    //    return false;
                    //}
                },
                clickImg: function (imgName) {
                    vmClassify.img = imgName;
                    //console.log(avalon.vmodels.loadIcon);
                    avalon.vmodels.loadIcon.close()
                }

            });

            var vmTag = avalon.define({
                $id: 'tag',
                id: '',
                name: '',
                modelRowIndex: 0,
                addCallback: function (name) {
                    if (!regValue.test(name)) {
                        sweetalert('请输入正确的标签名称', '只允许中文、英文字母、数字以及下划线(_)', 'info')
                        return;
                    }
                    //add
                    $.ajax(Action.urlAddTag, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: name })
                    }).done(function (server) {
                        if (server.code === 0) {
                            vmTag.name = vmTag.id = '';
                            $tagTable.bootstrapTable('append', [{
                                TTagName: name,
                                TTagId: server.data
                            }]);
                            sweetalert({
                                title: '添加标签成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常',
                                text: server.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                },
                editCallback: function (id, name) {
                    if (!regValue.test(name)) {
                        sweetalert('请输入正确的标签名称', '只允许中文、英文字母、数字以及下划线(_)', 'info')
                        return;
                    }
                    $.ajax(Action.urlEditTag, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: name, id: id })
                    }).done(function (result) {
                        if (result.code === 0) {
                            $tagTable.bootstrapTable('updateRow', {
                                index: vmTag.modelRowIndex,
                                row: {
                                    TTagId: id,
                                    TTagName: name
                                }
                            });
                            vmTag.name = vmTag.id = '';
                            vmTag.modelRowIndex = 0;
                            sweetalert({
                                title: '编辑标签成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常',
                                text: result.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                },
                add: function (name) {
                    var name = name.trim();
                    if (!name.length) {
                        //sweetalert({
                        //    title: '请输入标签名称',
                        //    type: 'info'
                        //});
                        return vmTag.elem.input.focus();
                    }
                    vmTag.id ? vmTag.editCallback(vmTag.id, name) : vmTag.addCallback(name);

                },
                keydown: function (e) {
                    if (e.keyCode === 13)
                        vmTag.add(vmTag.name);
                },
                cancel: function () {
                    vmTag.id = vmTag.name = '';
                    vmTag.index = 0;
                },
                set: function (name, id, index) {
                    vmTag.name = name;
                    if (id) {
                        vmTag.id = id;
                    }
                    if (index != null)
                        vmTag.modelRowIndex = index;
                },
                del: function (id) {
                    $.ajax(Action.urlDelTag, {
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ id: id })
                    }).done(function (result) {
                        if (result.code === 0) {
                            $tagTable.bootstrapTable('remove', {
                                field: 'TTagId',
                                values: [id + '']//bootStrapTable的bug，因为dataId是被jQuery转成了数字，导致bootStrapTable检测BlogId字段是否相等的时候发生了bug
                            });
                            sweetalert({
                                title: '删除标签成功',
                                type: 'success'
                            });
                        } else {
                            sweetalert({
                                title: '服务器返回异常',
                                text: result.msg,
                                type: 'error'
                            });
                        }
                    }).fail(function () {
                        sweetalert({
                            title: '网络连接异常',
                            type: 'warning'
                        });
                    });
                }
            });

            avalon.scan();
            var tableTemplate = {
                ICON: '<img src="' + Action.sourceClassify + '${0}" alt="" class="blog-other-icon"/>',
                CLASSIFYOPERATOR: '<a class="btn btn-info fa fa-edit data-edit" href="javascript:;" data-id="${id}"  data-index="${index}" data-icon="${img}" data-name="${name}" title="编辑"></a>\
                               <a class="btn btn-danger fa fa-trash-o data-delete" href="javascript:;" data-id="${id}" data-name="${name}" title="删除"></a>',
                DELETE: '您确定要删除${0}[ <span style="color:red;font-weight:bold;">${1}</span> ]么？该删除操作<span style="color:red;font-weight:bold;">不可恢复</span>，且该删除项有可能正在被引用',
                TAGOPERATOR: '<a class="btn btn-info fa fa-edit data-edit" href="javascript:;" data-id="${id}" data-index="${index}" data-name="${name}" title="编辑"></a><a class="btn btn-danger fa fa-trash-o data-delete" href="javascript:;" data-id="${id}" data-name="${name}" title="删除"></a>'
            },
                //分类
                $classifyTable = $(vmClassify.elem.table).bootstrapTable({
                    columns: [
                        //{ field: 'ClassifyId', title: 'ID', visible: false, },
                        { field: 'CName', title: '名称', align: 'left', valign: 'bottom', sortable: true },
                        {
                            field: 'CIcon', title: 'Icon', align: 'left', valign: 'bottom', 'class': 'td-img', formatter: function (value) {
                                return so.format(tableTemplate.ICON, value);
                            }
                        },
                        {
                            field: 'ClassifyId', title: '操作', align: 'center', valign: 'bottom', formatter: function (value, row, index) {
                                return so.format(tableTemplate.CLASSIFYOPERATOR, {
                                    id: value,
                                    index: index,
                                    img: row.CIcon,
                                    name: row.CName
                                });
                            }
                        }],
                    data: PageDatas.classify
                }).on('click', '.data-edit', function (e) {
                    var data = this.dataset;
                    vmClassify.set(data.icon, data.name, data.id, +data.index);
                    vmClassify.elem.input.focus();
                    vmClassify.elem.input.select();
                    //vmClassify.elem.input.setSelectionRange(0, 1000)
                }).on('click', '.data-delete', function (e) {
                    var data = this.dataset;
                    deleteDialog(so.format(tableTemplate.DELETE, '分类', data.name)).then(function () {
                        vmClassify.del(data.id);
                    });
                }),
                //标签
                $tagTable = $(vmTag.elem.table).bootstrapTable({
                    columns: [
                    //{ field: 'TTagId', title: 'ID', visible: false, },
                    {
                        field: 'TTagName',
                        title: '名称',
                        align: 'left',
                        sortable: true
                    },
                    {
                        field: 'TTagId',
                        title: '操作',
                        align: 'center',
                        formatter: function (value, row, index) {
                            return so.format(tableTemplate.TAGOPERATOR, {
                                id: value,
                                index: index,
                                name: row.TTagName
                            });
                        }
                    }],
                    data: PageDatas.tags
                }).on('click', '.data-edit', function (e) {
                    var data = this.dataset;
                    vmTag.set(data.name, data.id, +data.index);
                    vmTag.elem.input.focus();
                    vmTag.elem.input.select();
                }).on('click', '.data-delete', function (e) {
                    var data = this.dataset;
                    deleteDialog(so.format(tableTemplate.DELETE, '标签', data.name)).then(function () {
                        vmTag.del(data.id);
                    });
                })
        });

    }

});