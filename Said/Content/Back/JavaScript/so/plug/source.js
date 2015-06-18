define(['jquery', 'so', 'upload', 'dialog'], function ($, so, upload, dialog) {
    var noop = function () { },
        findIndex = Array.prototype.find
    config = {
        //解析的数据格式
        data: {
            total: 100,//总数
            datas: [
            {
                id: '资源id',//model
                name: '资源名称',
                data: '资源数据',
                img: '显示图片',
            }]
        },
        id: '',
        className: '',
        loadUrl: '/',
        deleteUrl: '',//删除资源的url，可选项目
        path: '/',//资源路径
        loading: '',//正在加载的时候显示的图片
        filters: ['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],
        size: 1048576,
        //doc: document.body,
        limit: 16,//每次翻页请求的个数
        offset: 1,//当前数据请求的起始索引，如果为-1则加载全部资源
        callback: noop,//点击确定执行
        cancel: noop,//点击取消执行
        remove: noop,//点击删除执行
        multiple: true//多选模式
    },
    globalTemplate = '<div id="${id}" class="source-box ${className}">\
            <div class="source-state">\
                <div class="source-path">路径：${path}</div>\
                <div class="source-count"><span>0</span>&nbsp;/&nbsp;0</div>\
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
                <div class="source-upload-box">\
                    <div class="icons-upload-box">\
                        <div style="z-index: 3; display: block;" class="so-upload-mask">\
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
        templateItem = '<div class="source-thum" data-id="${id}" data-name="${name}" data-data="${data}">\
                <div class="source-thum-con" title="引用在文章《世界很大，风住过这里》">\
                    <img src="${path}${img}" alt="100%x180" data-src="loading" data-holder-rendered="true" />\
                </div>\
                <div class="source-img-info"><span class="source-img-name">${name}</span><a href="javascript:;" data-id="${id}" class="fa fa-times source-delete" title="删除"></a></div>\
            </div>';

    var Source = function (doc, options) {
        var self = this,
            $doc = self.$doc = $(doc),
            options = this.options = $.extend({}, Source.DEFAULTS, options),
            template = globalTemplate,
            $elem,
            datas = self.datas = [],
            $table,//滚动条容器
            $body,//滚动条内容
            offset = options.offset,
            loadingHeight = 51,//正在加载的DOM高度是61
            errorDialog = self.errorDialog = dialog(),
            deleteDialog = self.deleteDialog = dialog(),
            $count,
            $load,
            isLoad = true;


        template = so.format(template, options);
        $elem = self.$elem = $(template);
        $table = $elem.find('.source-table');
        $body = self.$body = $table.find('.source-body');
        $count = $elem.find('.source-count');//数量
        $load = $table.find('.source-loading');//加载条

        self._initUpload();
        self._initDialog();

        $body.on('scroll', function () {
            var scrollTop = $body.scrollTop();
            var scrollHeight = $table.height();
            var windowHeight = $(this).height();
            if (scrollTop >= scrollHeight - windowHeight) {
                alert("到达底部");
                //加载数据
            }
        }).on('source.click', '.source-thum', function () {//选中
            var isSelect = this.classList.contains('selected');
            this.classList[isSelect ? 'remove' : 'add']('selected');
            isSelect ?
                self._removeData(this.dataset.id) :
                self._data(this.dataset);

        }).on('source.click', '.source-delete', function () {//删除
            deleteDialog.on('您确定要删除图片[ ' + this.dataset.name + ' ]么？', function () {
                var id = this.dataset.id;
                self._removeData(id);
                $(this.parentNode.parentNode).remove();
                self.options.remove(id);
            }).show();
        }).on('source.load', 'img', function () {
            console.log(this);
        });
        this._fetch({ limit: this.options.limit, offset: offset }, function (data) {
            this.options.total = data.total;
            $count.html('<span>0</span>&nbsp;/&nbsp;' + data.total + '');
            if (data.total === 0) {//没有数据
                $load.hide();
                isLoad = false;
                $body.off('scroll').html('<div class="source-noResult">没有数据</div>');
            }
        });
        this.dialog = dialog($elem[0], {
            className: 'source-dialog',
            btns: ''
        }).on(function () {
            if (datas.length)
                datas.apply($elem[0], datas);
        });
        $doc.append(this.dialog.elem);
    };


    //上传的图片插入到DOM
    Source.prototype._insert = function (data) {
        this.datas.unshift(data);
        this.$body.append(so.format(templateItem, data));
        return this;
    };

    Source.prototype._initUpload = function () {
        var self = this,
            $elem = self.$elem.find('.so-upload-mask'),//蒙版
            $text = $elem.find('.so-upload-text'),//文本
            $progress = $elem.find('.so-upload-progress');//进度
        upload($elem.find('.hidden-file'), {
            callback: function (data) {
                if (data.code === 0) {
                    self._insert(data);
                    //TODO 更新总数

                } else {
                    self.errorDialog.text(data.msg).show();
                }
            },
            fail: function (error) {
                self.errorDialog.text(error.msg).show();
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
    };

    Source.prototype._initDialog = function () {
        var $elem = this.$elem;
        this.dialog = dialog($elem[0]).on(function () {
            //确定

        }, function () {
            //关闭
        });
    };

    Source.prototype._data = function (data) {
        this.datas.push(data);
        return this;
    };


    Source.prototype._removeData = function (id) {
        var index = -1;
        if (!id) return this;
        this.datas.some(function (item, i) {
            if (item.id === id) {
                index = i;
                return true;
            }
        });
        ~index && this.datas.splice(index, 1);
        return this;
    };

    //根据数据生成
    Source.prototype._create = function (datas) {
        var path = this.options.path;
        var html = datas.map(function (obj) {
            obj.path = path;
            return so.format(templateItem, obj);
        }).join('');

        this.$body.append(html);
    };

    Source.prototype._fetch = function (data, callback) {
        //注意要判定翻页
        var self = this, $elem = self.$elem;
        $.ajax({
            url: self.options.loadUrl,
            contentType: 'application/json',
            dataType: 'json',
            data: data
        }).done(function (data) {
            if (data.total < 0) {
                return;
            }
            self._create(data.datas);
            //解析数据
            if ($.isFunction(callback))
                callback(data);
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
        //传递的dom将会被吸附到上面?????因为这里的this(jquery/dom)完全用不到啊..
        var $this = $(this);
        var data = $this.data('source');
        if (!data) {
            $this.data('source', (data = new Source(this, options)));
            $this.on('source.show', function () {
                data.show();
            }).on('source.hide', function () {
                data.hide();
            });
        }
        return $this;
    };
    $.source = function (elem, options) {
        return $(elem).source(options);
    };
});