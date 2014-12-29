'use strict';
define(['jquery', 'so'], function ($, so) {
    //得到文件后缀表达式
    var fileExttension = /\.[^\.]+/i,
        imgMaxSize = 1048576,//图片文件允许的最大大小，1mb
        Upload = function (elem, action, filters, callback, fail, maxSize) {
            //(要建立upload对象的元素/id,要上传的路径,过滤文件,上传成功后执行的回调函数,初始化给定的默认值)
            if (!(this instanceof Upload))
                return new Upload(elem, action, filters, callback, fail, maxSize);
            if (typeof fail === 'number')
                maxSize = maxSize;
            maxSize = maxSize || imgMaxSize;
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
                if (lock)//如果拦截没有效果则使用：e.preventDefault();
                    return false;
            });
            that.input.addEventListener('change', function (e) {
                lock = true;
                var self = that,
                    file = this.files[0],
                    name = file.name,
                    size = file.size,
                    type = file.type || '',
                    ext = name.lastIndexOf('.'),//文件后缀，找到索引
                    //根据最后修改日期标志文件上传
                    id = (file.lastModifiedDate + "").replace(/\W/g, '') + size + type.replace(/\W/g, ''),
                    xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                    data = new FormData();
                if (ext !== -1)
                    ext = name.substring(ext + 1).toLowerCase();
                //尝试后缀名验证，如果后缀名验证则尝试使用文件MIME验证
                if (ext === -1 || (filters.indexOf(ext) === -1 && type !== '' && filters.indexOf(type) === -1)) {
                    fail && fail.call(self, { code: 2, msg: '<p>上传的文件不是可以接受的文件类型</p><p>可接受类型：</p>' + filters.join(',') }, file);
                    return;
                }
                if (size > maxSize) {
                    fail && fail.call(self, { code: 1, msg: '上传的文件超过了约定的最大大小（>' + Math.floor(maxSize / 1024 / 1024) + 'MB）' }, file);
                    return;
                }


                //验证合法性

                data.append('name', encodeURIComponent(name));
                data.append('fileId', id);
                /*
                    参考：http://javascript.ruanyifeng.com/bom/ajax.html#toc1
                    formData对象append方法很碉堡...
                */
                data.append('saidFile', file.slice(0), encodeURIComponent(name));//

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
                                callback && callback.call(self, data, 0);
                            } catch (e) {
                                //这是什么Error
                                fail && fail.call(self, { code: 3, msg: '服务器返回的并不是可解析的结果' }, data);
                            }
                            //上传完成
                        } else {
                            fail && fail.call(self, { code: 4, msg: '服务器返回异常' }, xhr);
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
    var database = function (namespace) {
        namespace += '.';
        var support = function () {
            return !!window.localStorage;
        }(),
            getKey = function (key) {
                if (!key) return key;
                if (~key.indexOf('.')) {//back.addSaid,有命名空间
                    return key;
                }
                return namespace + key;
            },
            rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
        return {
            support: support,
            //get/set 本地数据库的值，set null表示清空该键
            val: function (key, value) {
                //【【【【【【【【【【后续强化对类型支持（支持对象的设置和获取）！】】】】】】】】】】
                if (arguments.length > 1) {
                    //set
                    if (support)
                        value == null ? localStorage.removeItem(getKey(key)) : localStorage.setItem(getKey(key), value);
                    return this;
                }
                //get
                value = support ? localStorage.getItem(getKey(key), value) || '' : '';
                //来自jQuery的jQuery.data
                return value === "true" ? true :
                        value === "false" ? false :
                        value === "null" ? null :
                        +value + "" === value ? +value :
                        rbrace.test(value) ? JSON.parse(value) :
                        value;
            },
            //清空数据库的指定命名空间下的数据
            clear: function (nameSpace) {
                nameSpace = nameSpace || namespace;

            }
            //, on: function () {

            //}
        };
    }('back.addSaid');
    return {
        Upload: Upload,
        ajax: function (data, action, done, fail) {
            //data是FormData对象
            var xhr = new XMLHttpRequest();
            xhr.open('post', action);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        done(JSON.parse(xhr.responseText), xhr);
                    } else {
                        //提交失败
                        fail(xhr);
                    }
                }
            }
            xhr.send(data);
        },
        DataBase: database
    };

    //$('._menuHover').each(function (i) {
    //    var elem = $(this), radix = 80;
    //    elem.mouseover(function () {

    //    });
    //});
});