define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div class="CLASS_CONTAINER" ms-visible="visible" ms-class="uploading:uploading" style="z-index:ZINDEX;">\
                        <span class="CLASS_TEXT">{{text}}</span>\
                     <div class="CLASS_PROGRESS" role="progressbar" ms-css-width="{{progress}}%"></div>\
                      <input type="file" class="CLASS_FILEINPUT" ms-visible="!uploading" ms-change="change($event)"/>\</div>',
        fileExttension = /\.[^\.]+/i,//得到后缀
        clearDirtyName = /\W/g,//清除脏字符
        noop = function () { };

    var widget = avalon.ui.upload = function (elem, data, vms) {
        var config = data.uploadOptions,
            filters = config.filters,
            done = $.isFunction(config.done) ? config.done : noop,
            fail = $.isFunction(config.fail) ? config.fail : noop,
            //multiple = options.multiple,
            containerDOM,
            viewModel;
        containerDOM = $.parseHTML(template.replace('CLASS_CONTAINER', config.classContainer || '')
                                          .replace('ZINDEX', config.zIndex || 3)
                                          .replace('CLASS_TEXT', config.classText || '')
                                          .replace('CLASS_PROGRESS', config.classProgress || '')
                                          .replace('CLASS_FILEINPUT', config.classFile || ''))[0];

        viewModel = avalon.define(data.uploadId, function (vm) {
            vm.visible = config.visible;
            vm.text = config.text;
            vm.uploading = false;
            vm.progress = 0;
            vm.change = function (e) {
                var file = e.target.files[0],
                    name = file.name,//文件名
                    size = file.size,//文件大小
                    type = file.type || '',//文件类型
                    ext = name.lastIndexOf('.'),//文件后缀，找到索引
                    id = (file.lastModifiedDate + "").replace(clearDirtyName, '') + size + type.replace(clearDirtyName, ''),//文件id=>修改日期标志
                    xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                    data = new FormData();
                if (config.filters !== '*') {
                    if (~ext)
                        ext = name.substring(ext + 1).toLowerCase();
                    //尝试后缀名验证，如果后缀名存在则尝试使用文件MIME验证

                    //TODO 需要检测file.type会不会一直存在
                    if (!~ext || (!~filters.indexOf(ext) && type !== '' && !~filters.indexOf(type))) {
                        fail(vm, { code: 2, msg: '上传的文件不是可以接受的文件类型' });
                        return;
                    }
                }
                if (config.size > 0 && size > config.size) {
                    fail(vm, { code: 1, msg: '上传的文件超过了约定的最大大小（>' + Math.floor(config.size / 1024 / 1024) + 'MB）' });
                    return;
                }
                data.append('name', encodeURIComponent(name));//追加文件名标志
                data.append('fileId', id);//追加文件id标志
                //上传的文件名，默认为"uploadFile",server可以通过Request.Files["uploadFile"]来获取上传的文件
                data.append(config.name, file /*file.slice(0)//如果需要支持断点续传的话*/, encodeURIComponent(name));//文件

                xhr.open('post', config.url, true);
                //xhr.setRequestHeader("Content-Disposition", 'Content-Disposition: form-data; name="img"; filename="blob"');
                if (config.progress)
                    xhr.upload.addEventListener("progress", function (e) {
                        vm.progress = Math.floor(e.loaded / size) * 100;
                    }, false);
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                vm.visible = !!done(vm, data);

                            } catch (e) {
                                vm.visible = !!done(vm, xhr, { code: 3, msg: '服务器返回的并不是可解析的结果' });
                            }
                            //上传完成
                        } else {
                            fail(vm, { code: 4, msg: '服务器返回异常' }, xhr);
                        }
                        vm.uploading = false;
                        vm.text = config.text;
                        config.progress && (vm.progress = 0);
                    }
                };
                xhr.send(data);
                vm.text = '上传中';
                vm.uploading = true;
            };
            vm.$init = function () {
                //elem.parentNode.replaceChild(containerDOM, elem);
                elem.appendChild(containerDOM);
                avalon.scan(containerDOM, [viewModel].concat(vms));
            };
            vm.$remove = function () {
                containerDOM.parentNode.removeChild(containerDOM);
                containerDOM = null;
            };

        });
        return viewModel;
    };
    widget.defaults = {
        val: function () { },
        classContainer: 'so-upload-mask',
        classText: 'so-upload-text',
        classProgress: 'so-upload-progress',
        classFile: 'so-upload-input',
        url: null,
        name: 'uploadFile',
        visible: true,
        //multiple: false,暂时还是不要支持了吧....
        progress: true,
        text: '上传缩略图',
        size: 1048576,//默认1mb，<=0表示允许无限
        filters: '*',//默认允许上传所有文件，为数组的话则限定上传的数组后缀
        //['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],//默认是图片
        done: noop,
        fail: noop,
        zIndex: 3
    };
    return widget;
});


