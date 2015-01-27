define(['so', 'jquery', 'upload'], function (so, $) {
    /**
     * so.upload上传文件插件，上传要求服务器传回json字符串格式的结果
     * @constructor
     * @param { string | Element } elem - 要构建upload的元素/元素id
     * @param { Object= } config - 配置
     * @param { string | Array } [config.filters = "*"] - 配置文件名过滤项，字符串仅允许为*（默认值，表示不过滤），为数组表示过滤除了这些后缀名之外的元素
     * @param { string } [config.url = "/"] - 文件上传的url，默认为"/"，表示上传到当前页面
     * @param { int } [config.size = 1048576] - 以byte为单位，表示上传文件大小允许的最大值，为负数表示不限制
     * @param { Function } config.callback - 上传成功的后执行的函数，参数[信息描述对象,服务器返回的参数],this指向elem
     * @param { Function= } config.fail - 上传失败后执行的函数，参数[信息描述对象，上传文件对象]，this指向elem
     * @param { Function= } config.progress - 上传中执行的函数，参数[上传进度，事件对象],this指向elem
     * @returns { Element } 返回查询得到的DOM（没有查询到返回null）
     */
    var globalConfig = {
        filters: ['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],//默认上传图片,
        url: '/Back/Source/UploadClassifyIcons/',//上传路径，默认本页
        imgUrl: '/Source/Sys/Images/',//图片默认读取路径
        img: '',//默认默认值
        value: ''//默认值
    },
    i = 0,
    UploadTest = function ($input, options) {
        //组件化
        var config = $.extend({}, globalConfig, options),
            _self = this,
            $prev = $input.prev(),//上传框和图片容器
            $uploadChildrens,//[上传框,图片]
            $fileInput,//inputFile输入框
            $img;//img对象
        if (!$prev.hasClass('upload-box')) {
            $prev = $('<div class="upload-box">\
                        <input type="file" tabindex="-1" class="hidden-upload">\
                        <img data-holder-rendered="true" src="data:image/png;base64,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" data-src="holder.js/100%x180" alt="img">\
                        </div>');
            $input.before($prev);
            $input.parent().addClass('iconInput');
        }
        $uploadChildrens = $prev.children();
        if (!$uploadChildrens.length) return;
        $fileInput = $uploadChildrens.eq(0);
        $img = $uploadChildrens.eq(1);
        if (!$fileInput.length || !$img.length) return;
        _self.$input = $input;
        _self.$fileInput = $fileInput;
        _self.$img = $img;
        _self.config = config;
        $input.on('keydown.uploadText', function (e) {
            if (e.keyCode === 8) {//backspace
                if (!this.value.trim().length && _self.img) {
                    _self.val('');
                    $fileInput.focus();
                }
            }
        });
        //$img.on('error.uploadText', function () {
        //    //_self.img = '';
        //});
        if (i++) {
            $fileInput.attr('data-fuck', 1);
        }
        so.upload($fileInput[0], {
            filters: config.filters,
            url: config.url,
            callback: function (data, file) {
                if (data.error === 0) {
                    _self.val($input.val(), data.name);
                    $input.focus();
                } else
                    config.fail && config.fail.call($input, data, file);
            },
            fail: function (data, file) {
                config.fail && config.fail.call($input, data, file);
            }
        });
    };

    UploadTest.prototype.val = function (value, imgValue) {
        if (!imgValue && value != null && value !== '') {//一个参数
            imgValue = value;
            value = '';
        }
        if (imgValue != null) {//=>val(value,imgValue);
            this.$img.attr('src', this.config.imgUrl + imgValue).show(0);
            if (value) {
                this.$input.val(value);
                this.value = value;
            }
            this.$fileInput.removeClass('hidden-upload');
            this.img = imgValue;
        } else if (value === '') {//val(true)=>重置上传样式
            this.$img.hide(0);
            this.$input.val('');
            this.$fileInput.addClass('hidden-upload');
            this.img = this.value = '';
        } else {//没有参数，获取值
            return { value: this.$input.val(), img: this.img };
        }
    };

    //破坏掉UploadTest对象 TODO
    UploadTest.prototype.destroy = function () {

    }
    /*
        $('#test').uploadTest(options) => options部署value||img的时候则自动赋值
        $('#test').uploadTest('')=>设置为上传状态
        $('#test').uploadTest(null)=>破坏uploadTest对象
        $('#test').uploadTest()=>获取值 => Object
    */
    $.fn.uploadText = function (options) {
        var data = this.data('uploadText.model'),
            optionType = typeof options === 'object';
        if (!data)
            this.data('uploadText.model', data = new UploadTest(this, options));
        if (options === '')
            data.val('');
        else if (optionType && (options.value != null || options.img != null))
            data.val(options.value, options.img);
        else if (options == null) {
            data.destroy();
        }
        return arguments.length ? this : data.val();

    }
});