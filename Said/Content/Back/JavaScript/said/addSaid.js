'use strict';
define(['jquery', 'so'], function ($, so) {
    var Upload = function (elem, action, filters, callback, def) {
        //(要建立upload对象的元素/id,要上传的路径,过滤文件,上传成功后执行的回调函数,初始化给定的默认值)
        if (!(this instanceof Upload))
            return new Upload(elem, action, filters, callback, def);
        elem = so(elem);
        var that = this,
            lock = false,
            item = that.element = elem[0],
            progress = that.progress = item.getElementsByClassName('progress-bar')[0],
            changeState = function (value) {
                progress.style.width = value + '%';
            };
        that.input = item.getElementsByTagName('input')[0];
        that.value = '';
        that.input.addEventListener('click', function (e) {
            //e.preventDefault();
            if (lock)
                return false;
        });
        //document.body.addEventListener('click', function (e) {
        //    e.preventDefault()
        //});
        that.input.addEventListener('change', function (e) {
            lock = true;
            var self = that,
                file = this.files[0],
                name = file.name,
                size = file.size,
                type = file.type || '',
                //根据最后修改日期标志文件上传
                id = (file.lastModifiedDate + "").replace(/\W/g, '') + size + type.replace(/\W/g, ''),
                xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                data = new FormData();
            data.append('name', encodeURIComponent(name));
            data.append('fileId', id);
            data.append('file', file.slice(0));
            xhr.open('post', action, true);
            xhr.upload.addEventListener("progress", function (e) {
                //上传中
                changeState(e.loaded / size * 100);
            }, false);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.readyState === 200) {
                        try {
                            var json = JSON.parse(xhr.responseText);
                            self.value = json;
                        } catch (e) {
                            //这是什么Error
                            console.log('这是什么error', e);
                        }
                        //上传完成
                    } else {

                    }

                } else {
                    //逻辑应该放到上面
                    item.style.display = 'none';
                    callback && callback.call(self, self.value);
                    //上传Error
                    console.error('上传error', xhr);
                }
                lock = false;
                changeState(0);
            };
            xhr.send(data);
        });
    };
    so.extend(Upload.prototype, {
        //send: function () {

        //},
        changeState: function (value) {

        },
        reset: function () {
            this.element.style.display = '';
        }
    });
    return {
        Upload: Upload
    };

    //$('._menuHover').each(function (i) {
    //    var elem = $(this), radix = 80;
    //    elem.mouseover(function () {

    //    });
    //});
});