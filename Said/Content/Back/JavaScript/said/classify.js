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
    UploadTest = function ($input, options) {
        //组件化
        var config = $.extend(globalConfig, options),
            _self = this,
            $uploadChildrens = $input.prev().children(),
            $fileInput,//inputFile输入框
            $img;//img对象
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
                    _self.val(true);
                    $fileInput.focus();
                }
            }
        });
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
        if (!imgValue && value !== true) {//一个参数
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
        } else if (value === true) {//val(true)=>重置上传样式
            this.$img.hide(0);
            this.$input.val('');
            this.$fileInput.addClass('hidden-upload');
            this.img = this.value = '';
        } else {//没有参数，获取值
            return { value: this.value, img: this.img };
        }
    };
    /*
        $('#test').uploadTest(options) => options部署value||img的时候则自动赋值
        $('#test').uploadTest()
    */
    $.fn.uploadText = function (options) {
        var data = this.data('uploadText.model'),
            optionType = typeof options === 'object';
        if (!data)
            this.data('uploadText.model', data = new UploadTest(this, options))
        if (options && (options.value || options.img))
            data.val(options.value, options.img);
        return options ? this : data.val();

    }
});