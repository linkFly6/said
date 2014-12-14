'use strict';
define(['jquery', 'so'], function ($, so) {
    var Upload = function (elem, action, filters, callback) {
        //(要建立upload对象的元素/id,要上传的路径,过滤文件,上传成功后执行的回调函数,初始化给定的默认值)
        if (!(this instanceof Upload))
            return new Upload(elem, action, filters, callback);
        elem = so(elem);
        var that = this,
            item = that.element = elem[0],
            complex = item.tagName === 'INPUT' ? false : true,
            lock = false,
            progress = that.progress = complex ? item.getElementsByClassName('progress-bar')[0] : false,
            changeState = function (value) {
                progress.style.width = value + '%';
            };
        that.input = complex ? item.getElementsByTagName('input')[0] : item;
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
            /*
                参考：http://javascript.ruanyifeng.com/bom/ajax.html#toc1
                formData对象append方法很碉堡...
            */
            data.append('saidImg', file.slice(0), encodeURIComponent(name));//

            xhr.open('post', action, true);

            //xhr.setRequestHeader("Content-Disposition", 'Content-Disposition: form-data; name="img"; filename="blob"');
            if (complex)
                xhr.upload.addEventListener("progress", function (e) {
                    //上传中
                    changeState(e.loaded / size * 100);
                }, false);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            self.value = data;
                            item.style.display = 'none';
                            callback && callback.call(self, data);
                        } catch (e) {
                            //这是什么Error
                            console.log('JSON数据转换失败');
                        }
                        //上传完成
                    } else {

                    }
                    lock = false;
                    if (complex)
                        changeState(0);
                }
            };
            xhr.send(data);
        });
    };
    so.extend(Upload.prototype, {
        changeState: function (value) {

        },
        toggle: function (isHide) {
            this.element.style.display = isHide == true ? 'none' : '';
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