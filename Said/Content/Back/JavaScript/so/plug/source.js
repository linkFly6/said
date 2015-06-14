define(['jquery', 'so', 'upload', 'dialog'], function ($, so, upload, dialog) {
    var config = {
        //解析的数据格式
        data: {
            total: 100,//总数
            datas: [
            {
                id: '资源id',//model
                name: '资源名称',
                data: '资源数据'
            }]
        },
        id: '',
        className: '',
        url: '/',
        deleteUrl: '',//删除资源的url，可选项目
        loading: '',//正在加载的时候显示的图片
        filters: ['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],
        size: 1048576,
        //doc: document.body,
        limit: 16,//每次翻页请求的个数
        offset: 1//当前数据请求的起始索引，如果为-1则加载全部资源
    },
        globalTemplate = '<div id="${id}" class="source-box ${className}">\
            <div class="source-state">\
                <div class="source-path">路径：${url}</div>\
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
                        <div style="z-index: 3; display: block;" class="so-upload-mask" disabled>\
                            <span class="so-upload-text">上传</span>\
                            <div role="progressbar" class="so-upload-progress" style="width: 10%;"></div>\
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
            templateItem = '<div class="source-thum">\
                <div class="source-thum-con" title="引用在文章《世界很大，风住过这里》">\
                    <img src="../../../Content/Images/UEDImg/20150514110936.jpg" alt="100%x180" data-src="loading" data-holder-rendered="true" />\
                </div>\
                <div class="source-img-info"><span class="source-img-name">20150613190551.jpg</span><a href="javascript:;" class="fa fa-times source-delete" title="删除"></a></div>\
            </div>';

    var Source = function (doc, options) {
        var $doc = this.$doc = $(doc),
            options = $.extend({}, Source.DEFAULTS, options),
            template = globalTemplate,
            $elem,
            $table,//滚动条容器
            $body,//滚动条内容
            offset = this.options.offset,
            loadingHeight = 51;//正在加载的DOM高度是61
        template = so.format(template, options);
        $elem = this.$elem = $(template);
        $table = $elem.find('.source-table');
        $body = $table.find('.source-body');
        upload($elem.find('.hidden-file'), {
            callback: function () {

            },
            fail: function () {

            },
            progress: function () {

            },
            upload: function (code) {
                //0:完成、1：上传中
            }
        });
        this.dialog = dialog($elem[0]).on(function () {
            //确定

        }, function () {
            //关闭
        });
        $body.on('scroll', function () {
            var scrollTop = $body.scrollTop();
            var scrollHeight = $table.height();
            var windowHeight = $(this).height();
            if (scrollTop >= scrollHeight - windowHeight) {
                alert("到达底部");
                //加载数据
            }
        });

        this._fetch({ limit: this.options.limit, offset: offset });
    };
    Source.prototype._fetch = function (data, callback) {
        var $elem = this.$elem;
        $.ajax({
            url: this.options.url,
            contentType: 'application/json',
            dataType: 'json',
            data: data
        }).done(function (data) {
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

    };
    $.source = function (elem, options) {

    };
});