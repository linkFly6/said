define('image.index', ['said', 'jquery', 'avalon', 'so', 'sweetalert', 'dialog', 'avalonUpload'], function (said, $, avalon, _, sweetalert, dialog, upload) {
    return function (Action, Source, ImageType) {
        $(function () {
            'use strict';
            var database = _.Database('back.Image');
            var imageUrl = {
                thumbnail: function (imgName, typeId) {
                    return (Source.thumbnail[typeId] || Source.thumbnail[0]) + imgName;
                },
                get: function (imgName, typeId) {
                    return (Source.image[typeId] || Source.image[0]) + imgName;
                }
            };
            var vmCurrData = avalon.define({
                $id: 'currData',
                ImageId: '',
                IName: '',
                Img: '',
                Date: '',
                ISize: '',
                Type: '',
                ReferenceCount: ''
            });

            var vmModel = avalon.define({
                $id: 'model',
                select: function (e, typeId) {
                    vmModel.typeText = typeof e === 'string' ? e : this.innerHTML;
                    vmModel.selectPath = Source.image[typeId] || '';
                    database.val('typeText', vmModel.typeText).val('typeId', typeId);
                    avalon.vmodels.uploadImages.visible = typeId < 4 || typeId > 6 ? true : false;
                    vmModel.reload(typeId);
                },
                multiple: false,
                typeId: -1,
                typeText: '',
                activeIndex: -1,
                selectPath: '',
                sum: 0,
                isLoading: false,
                datas: [],
                caches: [],//已经翻页加载过的数据就不要再加载了
                toggleMultiple: function () {
                    vmModel.multiple = !vmModel.multiple;
                },
                deleteImage: function (e, item, i) {
                    sweetalert({
                        title: '确定删除？',
                        text: '您确定要永久删除图片【<span class="said-red said-bold"> ' + item.IName + ' </span>】么？',
                        html: true,
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: '确认删除',
                        closeOnConfirm: false,
                        cancelButtonText: '取消',
                        //配置正在加载
                        showLoaderOnConfirm: true
                    }, function (isConfirm) {
                        if (isConfirm) {
                            said.ajax(Action.realDeleteImage, {
                                id: item.ImageId
                            }).done(function (result) {
                                if (result.code === 0) {
                                    sweetalert('删除成功', '删除图片成功', 'success');
                                    vmModel.datas.splice(i, 1);
                                    //更新缓存池
                                    var index = vmModel.offset + i;
                                    if (vmModel.caches[index]) vmModel.caches.splice(index, 1);
                                } else {
                                    sweetalert('删除异常', '服务器返回异常：' + result.msg, 'error');
                                }
                            }).fail(function () {
                                sweetalert('删除异常', '网络连接异常', 'error');
                            });
                        }
                    });
                    e.stopPropagation();
                },
                convertSize: function (size) {//byte
                    if (!size) return '未知';
                    size = size / 1024;
                    if (size > 1024)
                        return (size / 1024).toFixed(2) + 'MB';
                    return size.toFixed(2) + 'KB';
                },
                resetActive: function () {
                    vmModel.activeIndex = -1;
                    vmCurrData.ImageId = '';
                },
                activeItem: function (item, i) {
                    vmModel.activeIndex = i;
                    vmCurrData.IName = item.IName;
                    vmCurrData.Img = imageUrl.get(item.IFileName, item.Type);
                    vmCurrData.Type = Source.typeName[item.Type] || '类型未知';
                    vmCurrData.Date = _.dateToLocal(item.Date);
                    vmCurrData.ReferenceCount = item.ReferenceCount;
                    vmCurrData.ISize = vmModel.convertSize(item.ISize);
                    vmCurrData.ImageId = item.ImageId;
                },
                /*分页*/
                limit: 12,//个数
                offset: 0,//数据起点
                pageIndex: 1,//当前页码
                pages: [],
                sumPage: 0,//总页码
                $skipArray: ['limit', 'offset', 'caches'],
                skipPage: function (pageIndex, sumPage) {
                    //console.log(pageIndex, sumPage);
                    var pages = [],
                        len = 0,
                        i = 0;
                    if (sumPage - pageIndex >= 5) {
                        if (pageIndex > 3) {
                            i = pageIndex - 2;
                            len = pageIndex + 2;
                        } else {
                            i = 1;
                            len = 5;
                        }

                    } else if (sumPage <= 5) {
                        i = 1;
                        len = sumPage;
                    } else {
                        i = sumPage - 4;
                        len = sumPage;
                    }
                    for (; i <= len; i++) {
                        pages.push(i);
                    }
                    //console.log(pages);//TODO 分页还要再调
                    this.pages = pages;
                },
                toTop: function () {
                    window.scrollTo(0, 0);
                },
                reload: function (typeId) {
                    vmModel.typeId = typeId;
                    vmModel.caches.length = 0;
                    vmModel.datas = [];
                    vmModel.load(1);
                },
                load: function (pageIndex) {
                    var self = vmModel,
                        pages = [];
                    //检查datas里面有没有
                    if (pageIndex) {
                        self.offset = parseInt((pageIndex - 1) * self.limit);
                        self.pageIndex = pageIndex;
                    }
                    //console.log(self.offset, self.limit);
                    vmModel.isLoading = true;
                    vmModel.toTop();
                    if (vmModel.caches[self.offset]) {//缓存池里有
                        vmModel.resetActive();
                        vmModel.datas = vmModel.caches.slice(self.offset, self.offset + self.limit);
                        self.skipPage(self.pageIndex, self.sumPage);
                        vmModel.isLoading = false;
                        return;
                    }
                    said.ajax(Action.getImageList, {
                        limit: self.limit,
                        offset: self.offset,
                        imageType: vmModel.typeId
                    }).done(function (res) {
                        if (res.total < 1) {
                            vmModel.pages = [];
                            vmModel.isLoading = false;
                            return;
                        };
                        vmModel.resetActive();
                        self.sum = res.total;
                        self.sumPage = res.total % self.limit === 0 ? res.total / self.limit : parseInt(res.total / self.limit) + 1;
                        vmModel.datas = [];
                        res.datas.forEach(function (item, i) {
                            //只能先处理res.datas，再赋值到vmModels.datas，否则会触发：TypeError: vmModel.datas[i] is undefined，因为浏览器的缓存！这里早早就触发了，但其实vmModel.datas还没有被赋值
                            item.img = _.imgLoad.DEFAULTS.load;
                            _.imgLoad({
                                src: imageUrl.thumbnail(item.IFileName, item.Type),
                                done: function (url) {
                                    vmModel.datas[i] ? vmModel.datas[i].img = url : item.img = url;
                                },
                                fail: function (url) {
                                    vmModel.datas[i] ? vmModel.datas[i].img = url : item.img = url;
                                }
                            });
                        });
                        vmModel.datas = res.datas;
                        vmModel.caches = vmModel.caches.concat(res.datas);
                        vmModel.isLoading = false;
                        self.skipPage(self.pageIndex, self.sumPage);
                    }).fail(function () {
                        vmModel.isLoading = false;
                        sweetalert({
                            'type': 'warning',
                            text: '加载数据异常'
                        })
                    });
                },



                //widget
                $uploadImagesConfig: {
                    classFile: 'hidden-file',
                    //name: 'testFile',
                    filters: Source.filters,
                    url: Action.upload,
                    text: '上传图片',
                    classContainer: 'upload-mask',
                    classText: 'upload-text',
                    classProgress: 'upload-progress',
                    size: Source.maxImageSize,
                    postData: function () {//postData是附带数据发送
                        return { imageType: vmModel.typeId };
                    },
                    done: function (vm, data) {
                        if (data.code) {
                            sweetalert('上传异常', '服务器返回异常：' + data.msg, 'error');
                        } else {
                            sweetalert('上传成功');
                            data.model.img = _.imgLoad.DEFAULTS.load;
                            _.imgLoad({
                                src: imageUrl.thumbnail(data.model.IFileName, data.model.Type),
                                done: function (url) {
                                    vmModel.datas[0] ? vmModel.datas[0].img = url : data.model.img = url;
                                },
                                fail: function (url) {
                                    vmModel.datas[0] ? vmModel.datas[0].img = url : data.model.img = url;
                                }
                            });
                            vmModel.sum++;
                            vmModel.datas.unshift(data.model);
                            vmModel.activeItem(vmModel.datas[0], 0);
                            //更新缓存池
                            if (vmModel.caches[vmModel.offset]) vmModel.caches.splice(vmModel.offset, 0, vmModel.datas[0]);
                            //data.model
                        }
                        return true;
                    },
                    fail: function (vm, data) {
                        sweetalert('上传异常', '异常信息：' + data.msg, 'error');
                    }
                }
            });

            avalon.scan();
            if (database.val('typeId')) {
                vmModel.typeText = database.val('typeText');
                vmModel.typeId = database.val('typeId');
                vmModel.selectPath = Source.image[vmModel.typeId] || '';
            }
            vmModel.load();
            //setTimeout(function () {

            //}, 300)
        });
    }


})