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
        url: '/',//上传路径，默认本页
        imgUrl: '/Source/Sys/',
        imgValue: '',//默认默认值
        value: ''//默认值
    },
        UploadTest = function (config) {
            config = $.extend(globalConfig, config);
            //已经初始化过了
            if (this.data('uploadText.inited')) {
                if (config.imgValue) {
                    this.data('uploadText.img', config.imgValue);
                    img = this.data('uploadText.img');
                    fileInput = this.data('uploadText.fileInput');
                    img.src = img.src = config.imgUrl + config.imgValue;
                    fileInput.removeClass('hidden-upload');
                    this.val(config.value || '');
                    img.show(0);
                }
                return this;
            }
            var input = this,//文本输入框
                uploadBox = this.prev(),
                fileInput,//inputFile输入框
                img;//img对象
            if (!uploadBox.length) return this;
            fileInput = $(uploadBox[0].firstElementChild);
            img = $(uploadBox[0].lastElementChild);
            if (!fileInput.length || !img.length) return this;
            var resetData = function () {
                img.hide(0);
                fileInput.addClass('hidden-upload');
                input.removeData('uploadText.img');
                config.imgValue = false;
            }
            if (!config.imgValue) {
                config.imgValue = false;
                resetData();
            } else {
                fileInput.removeClass('hidden-upload');
                img.show(0);
                input.val(config.value || '');
            }
            input.data('uploadText.elemObject', {
                fileInput: fileInput,
                img: img
            });
            this.on('input.uploadText', function (e) {
                if (e.keyCode === 8) {//backspace
                    if (!this.value.trim().length && config.imgValue !== false)
                        resetData();
                }
            });
            so.upload(fileInput, {
                filters: config.filters,
                url: config.url,
                callback: function (info, data) {
                    if (info.error === 0) {
                        config.imgValue = data.name;
                        fileInput.removeClass('hidden-upload');
                        img.src = config.imgUrl + config.imgValue;
                        img.show(0);
                        input.data('uploadText.img', config.imgValue);
                    } else
                        config.fail && config.fail.call(input, info, data);
                },
                fail: function (info, data) {
                    resetData();
                    config.fail && config.fail.call(input, info, data);
                }
            });

            return this.data('uploadText.inited', true);
        }
    $.fn.extend({
        uploadText: UploadTest
    });
});