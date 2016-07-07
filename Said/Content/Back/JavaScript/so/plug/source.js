define(['jquery', 'so', 'underscore', 'dialog', 'upload', 'sweetalert'], function ($, so, _, dialog, upload, sweetalert) {
    'use strict';
    var noop = function () { },
        //push = Array.prototype.push,
        //splice = Array.prototype.splice,
        //each = Array.prototype.forEach,
        //indexOf = Array.prototype.indexOf,
        config = {
            //解析的数据格式
            //data: {
            //    total: 100,//总数
            //    datas: [ //数据库返回
            //    {
            //        id: '资源id',//model
            //        name: '资源名称',
            //        data: '资源数据',
            //        img: '显示图片',
            //    }],
            //    datas: { //对象存储
            //        '资源ID': {
            //            name: '资源名称',
            //            data: '资源数据',
            //            img: '显示图片'
            //        }
            //    }
            //},
            id: '',
            className: '',
            zIndex: 4,
            multiple: true,//多选模式

            // ============= url配置
            loadUrl: '/',//加载资源的路径
            deleteUrl: '/',//删除资源的url，可选项目
            uploadUrl: '',//上传的url，没有指定则没有上传功能
            path: '/',//资源路径

            // ============= 上传项
            filters: ['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],
            size: 1048576,

            // ============= 分页
            limit: 16,//每次翻页请求的个数
            offset: 0,//当前数据请求的起始索引，如果为-1则加载全部资源


            // ============= 回调函数
            callback: noop,//点击确定执行
            cancel: noop,//点击取消执行
            remove: noop,//点击删除执行

            // ============= 资源加载
            imgLoading: '/Content/Images/Said-Images-load.gif',//正在加载的时候显示的图片
            imgFail: '/Content/Images/img-failed.png'//正在加载的时候显示的图片
        },
    globalTemplate = '<div id="${id}" class="source-box ${className}">\
            <div class="source-state">\
                <div class="source-path">路径：${path}</div>\
                <div class="source-count"><span class="source-count-curr">0</span>/<span class="source-count-sum">0</span></div>\
            </div>\
            <div class="source-table">\
                <div class="source-body"></div>\
                <div class="source-loading">\
                    <div class="loading-line">\
                        <span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>\
                    </div>\
                </div>\
            </div>\
            <div class="source-footer">\
                <div class="source-upload-box" style="UPLOAD">\
                    <div class="icons-upload-box">\
                        <div style="z-index: 3;" class="so-upload-mask">\
                            <span class="so-upload-text">上传</span>\
                            <div role="progressbar" class="so-upload-progress" style="width: 0"></div>\
                            <input type="file" class="hidden-file" style="display: block;" />\
                        </div>\
                    </div>\
                </div>\
                <div class="source-btns-box">\
                    <a href="javascript:;" class="btn btn-success">确定</a>\
                    <a href="javascript:;" class="btn btn-default">取消</a>\
                </div>\
            </div>\
        </div>',
        templateItem = '<div class="source-thum" data-id="${ImageId}">\
                <div class="source-thum-con">\
                    <img src="${loading}" alt="100%x180" data-src="${path}${IFileName}" data-holder-rendered="true" />\
                </div>\
                <div class="source-img-info"><span class="source-img-name">${IName}</span><a href="javascript:;" data-id="${ImageId}" data-name="${IFileName}" class="fa fa-times source-delete" title="删除"></a></div>\
            </div>';

    var Source = function (doc, options) {
        var self = this,
            $doc = self.$doc = $(doc),
            options = this.options = $.extend({}, Source.DEFAULTS, options),
            template = globalTemplate,
            $elem,
            $table,//滚动条容器
            $body,//滚动条内容
            offset = options.offset,
            loadingHeight = 51,//正在加载的DOM高度是61
            errorDialog = self.errorDialog = dialog({ zIndex: options.zIndex + 1 });
        options.img = {
            load: options.imgLoading,
            error: options.imgFail
        };
        template = template.replace('UPLOAD', options.uploadUrl ? '' : 'display:none')
        template = so.format(template, options);
        //DOM
        $elem = self.$elem = $(template);
        $table = $elem.find('.source-table');
        $body = self.$body = $table.find('.source-body');
        self.$sum = $elem.find('.source-count-sum');
        self.$curr = $elem.find('.source-count-curr');


        //数据
        this.total = 0;//当前列表总数
        this.ids = [];//当前已经选中的数据
        this.datas = [];//远程请求来的数据
        this.$load = $table.find('.source-loading');//加载条


        //事件
        self._initUpload($elem, this.options.uploadUrl)
            ._initDialog($doc, $elem, this.options.callback, this.options.cancel)
            ._initScroll($table, $body)
            ._initEvent($body);


        this._fetch({ limit: this.options.limit, offset: offset, imageType: this.options.type }, function (data) {
            self._setCount(this.total = data.total);
            //this.$sum.html(data.total);
            if (data.total === 0) {//没有数据
                $body.html('<div class="source-noResult">没有数据</div>');
            }

        });

    };


    Source.prototype._initEvent = function ($body) {
        var self = this,
            cache = null,
            selectHandle = self.options.multiple ?
            function () { //多选
                var isSelect = this.classList.contains('selected');
                if (isSelect) {
                    this.classList.remove('selected');
                    self._removeData(this.dataset.id);
                } else {
                    this.classList.add('selected');
                    self._data(this.dataset.id)
                }
            } : function () {//单选
                var isSelect = this.classList.contains('selected');
                if (isSelect) {
                    this.classList.remove('selected');
                    self._removeData(this.dataset.id);
                    cache = null;
                } else {
                    this.classList.add('selected');
                    self._data(this.dataset.id);
                    if (cache) {
                        cache.classList.remove('selected');
                        self._removeData(cache.dataset.id);
                    }
                    cache = this;
                }

            };
        $body.on('click.source', '.source-thum', selectHandle)
             .on('click.source', '.source-delete', function () {//删除
                 var elem = this;
                 sweetalert({
                     title: '确定删除？',
                     text: '您确定要删除图片[<span style="color:red;padding:0 0.5em;">' + this.dataset.name + '</span>]么？',
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
                         var id = elem.dataset.id,
                         index = self._searchIndexOf(self.datas, id);
                         $.ajax({
                             url: self.options.deleteUrl,
                             contentType: 'application/json',
                             dataType: 'json',
                             type: 'post',
                             data: JSON.stringify({ id: id })
                         }).done(function (data) {
                             if (data.code !== 0)
                                 sweetalert('删除图片失败', '服务器返回消息：' + data.msg, 'error');
                             else {
                                 ~index && self.datas.splice(index, 1);
                                 $(elem.parentNode.parentNode).remove();
                                 self._setCount(--self.total);
                                 sweetalert('删除成功', '删除图片成功！', 'success');
                             }

                         }).fail(function (res) {
                             sweetalert('删除图片失败', '网络连接异常', 'error');
                         });
                     }
                     
                 })
                 return false;
             });
        return this;
    }


    //图片加载处理
    Source.prototype._loadImg = function ($img) {
        var self = this, options = self.options.img;
        $img.each(function () {
            so.imgLoad(this, options);
        });
    }

    Source.prototype._initScroll = function ($table, $body) {
        var isLoad = false,
            self = this,
            //利用underscore进行函数节流
            callback = _.debounce(function () {
                if (isLoad) return;
                var scrollTop = this.scrollTop,
                    //因为高度随时会改变，所以这里不能获取固定的高度
                    windowHeight = $table.height(),
                    scrollHeight = $body.height();
                if (scrollTop >= scrollHeight - windowHeight) {
                    //加载数据
                    isLoad = true;
                    self._fetch({ limit: self.options.limit, offset: (self.options.offset += self.options.limit), imageType: self.options.type }).always(function (data) {
                        if (data && data.total && self.datas.length >= data.total) {//所有数据全部加载完成
                            //isLoad = true;
                            $table.off('scroll');
                        } else
                            isLoad = false;
                    });
                }
            }.bind($table[0]), 200);
        $table.on('scroll', callback);
        return this;
    };

    Source.prototype._setCount = function (sum) {
        this.$sum.html(sum);
        return this;
    }

    Source.prototype._initUpload = function ($elem, url) {
        if (!this.options.uploadUrl) return this;
        var self = this,
            data = this.options.type,
            $elem = self.$elem.find('.so-upload-mask'),//蒙版
            $text = $elem.find('.so-upload-text'),//文本
            $progress = $elem.find('.so-upload-progress');//进度
        upload($elem.find('.hidden-file')[0], {
            url: url,
            data: { imageType: data },
            callback: function (data) {
                if (data.code === 0) {
                    self._insert(data.model);
                } else {
                    sweetalert('上传失败', '异常信息：' + data.msg, 'error');
                }
            },
            fail: function (error) {
                sweetalert('上传失败', '异常信息：' + error.msg, 'error');
            },
            progress: function (value) {
                $progress.css('width', value + '%');
            },
            upload: function (code) {
                //0:完成、1：上传中
                switch (code) {
                    case 1://上传
                        $elem.attr('disabled', 'disabled');
                        break;
                    default:
                        $elem.removeAttr('disabled');
                        break;
                }
            }
        });
        return this;
    };

    Source.prototype._initDialog = function ($doc, $elem, callback, cancel) {
        var self = this,
            $box;
        self.dialog = dialog($elem[0], {
            className: 'source-dialog',
            btns: '',
            zIndex: self.options.zIndex
        });
        $doc.append(self.dialog.elem);
        $box = $(self.dialog.elem);

        $box.find('.btn-success').on('click.source', function () {
            if (callback.apply($elem[0], self._get()) !== false)//返回false则不关闭
                self.hide();
        });
        //TODO 这个取消怎么破？？点击蒙板dialog是不会触发取消的
        $box.find('.btn-default').on('click.source', function () {
            cancel && cancel.call($elem[0]);
            self.hide();
        });
        return this;
    };

    //根据id获取指定数组中的索引位置
    Source.prototype._searchIndexOf = function (datas, id) {
        var index = -1;
        datas.some(function (item, i) {
            if (item.ImageId === id) {
                index = i;
                return true;
            }
        });
        return index;
    };


    ////根据id获取数据
    //Source.prototype._get = function (id) {
    //    var data = null, index;
    //    if (!id) return data;
    //    index = this._searchIndexOf(this.dataCenter, id);
    //    data = ~index ? this.dataCenter[index] : data;
    //    return data;
    //}


    Source.prototype._data = function (id) {
        //This key already exists
        if (~this._searchIndexOf(this.datas, id)) {
            this.ids.push(id);
            this.$curr.html(this.ids.length);
        }
        return this;
    };

    Source.prototype._removeData = function (id) {
        var index;
        if (!id || !~(index = this.ids.indexOf(id))) return this;
        this.ids.splice(index, 1);
        //console.info(this.data.length);
        this.$curr.html(this.ids.length);
        return this;
    };

    //获取当前已经选中的对象数据
    Source.prototype._get = function (ids) {
        ids = ids ? [ids] : this.ids;
        return this.datas.filter(function (item) {
            return ~ids.indexOf(item.ImageId);
        })
    };

    //上传的图片插入到DOM
    Source.prototype._insert = function (data) {
        this.datas.unshift($.extend({}, data));
        data.path = this.options.path;
        this._setCount(++this.total);
        data.loading = this.options.imgLoading;
        var $elem = $(so.format(templateItem, data));
        this._loadImg($elem.find('img'));
        this.$body.prepend($elem);
        return this;
    };

    //根据数据生成
    Source.prototype._create = function (datas) {
        var self = this,
            path = self.options.path,
            loadingImg = self.options.imgLoading;
        var $elems = $(datas.map(function (obj) {
            obj.path = path;
            obj.loading = loadingImg;
            return so.format(templateItem, obj);
        }).join(''));
        self._loadImg($elems.find('img'));
        this.$body.append($elems);
    };

    Source.prototype._fetch = function (data, callback) {
        //注意要判定翻页
        var self = this, $elem = self.$elem;
        return $.ajax({
            url: self.options.loadUrl,
            contentType: 'application/json',
            //type: 'post',
            dataType: 'json',
            data: data
        }).done(function (data) {
            if (data.total < 0) {
                return;
            }
            //数据全部加载完成
            self._create(data.datas);
            self.datas = self.datas.concat(data.datas);
            if (self.datas.length >= data.total)
                self.$load.hide();

            //解析数据
            if ($.isFunction(callback))
                callback.call(self, data);
        })
        .fail(function (res) {
            $elem.trigger('source.error', res.status);
        })
    };

    Source.prototype.show = function () {
        this.dialog.show();
    };
    Source.prototype.hide = function () {
        this.dialog.hide();
    };


    Source.DEFAULTS = config;
    $.fn.source = function (options) {
        //var $this = $(this);
        //var data = $this.data('source');
        //if (!data) {
        //    $this.data('source', (data = new Source(this, options)));
        //    $this.on('source.show', function () {
        //        data.show();
        //    }).on('source.hide', function () {
        //        data.hide();
        //    });
        //}
        //return $this;
        return new Source(this, options);
    };
    $.source = function (options) {
        return $(document.body).source(options);
    };
});