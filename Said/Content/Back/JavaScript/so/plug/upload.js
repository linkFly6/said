(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;

    //得到文件后缀表达式
    var so = window.so,
        fileExttension = /\.[^\.]+/i,//得到后缀
        clearDirtyName = /\W/g,//清除脏字符
        imgMaxSize = 1048576,//图片文件允许的最大大小，1mb
        globalConfig = {
            filters: '*',//默认允许上传所有文件，为数组的话则限定上传的数组后缀
            url: '/',//上传路径，默认本页
            //['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],//默认是图片
            size: 1048576//默认1mb，<=0表示允许无限
            /*
            ,callback: function () { },//成功后执行的函数，必须指定
            fail: function () { },//失败后执行的函数
            progress: function () { }//上传中执行的函数
            data://TODO=>附加参数，以后尝试支持
            */
        },
        /**
         * so.upload上传文件插件，上传要求服务器传回json字符串格式的结果
         * @constructor
         * @param { string | Element } elem - 要构建upload的元素/元素id
         * @param { Object= } config - 配置
         * @param { string | Array } [config.filters = "*"] - 配置文件名过滤项，字符串仅允许为*（默认值，表示不过滤），为数组表示过滤除了这些后缀名之外的元素
         * @param { string } [config.url = "/"] - 文件上传的url，默认为"/"，表示上传到当前页面
         * @param { int } [config.size = 1048576] - 以byte为单位，表示上传文件大小允许的最大值，为负数表示不限制
         * @param { Function } config.callback - 上传成功的后执行的函数，参数[服务器返回的参数,上传文件对象],this指向elem
         * @param { Function= } config.fail - 上传失败后执行的函数，参数[信息描述对象，上传文件对象]，this指向elem
         * @param { Function= } config.progress - 上传中执行的函数，参数[上传进度，事件对象],this指向elem
         * @returns { Element } 返回查询得到的DOM（没有查询到返回null）
         */
        Upload = function (elem, config) {
            config = so.extend(globalConfig, config);
            elem = so.find(elem);
            if (!elem || elem.tagName !== 'INPUT' || elem.type !== 'file' || !so.isFunction(config.callback)) return elem;
            if (config.filters.length)
                config.filters = '*';
            var lock = false,
                isMultiple = elem.multiple ? true : false,//是否多选
                callback = config.callback,
                fail = so.isFunction(config.fail) ? config.fail : false,
                progress = so.isFunction(config.progress) ? config.progress : false;
            so.on(elem, 'click', function () {
                return !lock;
            });
            so.on(elem, 'change', function (e) {
                lock = true;
                var file = this.files[0],
                    name = file.name,//文件名
                    size = file.size,//文件大小
                    type = file.type || '',//文件类型
                    ext = name.lastIndexOf('.'),//文件后缀，找到索引
                    id = (file.lastModifiedDate + "").replace(clearDirtyName, '') + size + type.replace(clearDirtyName, ''),//文件id=>修改日期标志
                    xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                    data = new FormData();
                if (config.filters !== '*') {
                    if (ext !== -1)
                        ext = name.substring(ext + 1).toLowerCase();
                    //尝试后缀名验证，如果后缀名验证则尝试使用文件MIME验证
                    if (ext === -1 || (filters.indexOf(ext) === -1 && type !== '' && filters.indexOf(type) === -1)) {
                        fail && fail.call(elem, { code: 2, msg: '上传的文件不是可以接受的文件类型' }, file);
                        return lock = false;
                    }
                }
                if (config.size > 0 && size > config.size) {
                    fail && fail.call(elem, { code: 1, msg: '上传的文件超过了约定的最大大小（>' + Math.floor(config.size / 1024 / 1024) + 'MB）' }, file);
                    return lock = false;
                }
                data.append('name', encodeURIComponent(name));//追加文件名标志
                data.append('fileId', id);//追加文件id标志
                /*
                    参考：http://javascript.ruanyifeng.com/bom/ajax.html#toc1
                    formData对象append方法很碉堡...
                */
                data.append('saidFile', file /*file.slice(0)//如果需要支持断点续传的话*/, encodeURIComponent(name));//文件
                xhr.open('post', config.url, true);
                //xhr.setRequestHeader("Content-Disposition", 'Content-Disposition: form-data; name="img"; filename="blob"');
                if (progress)
                    xhr.upload.addEventListener("progress", function (e) {
                        progress.call(elem, e.loaded / size * 100, e);
                    }, false);
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                callback && callback.call(elem, data, file);
                            } catch (e) {
                                //这是什么Error
                                fail && fail.call(elem, { code: 3, msg: '服务器返回的并不是可解析的结果' }, file);
                            }
                            //上传完成
                        } else {
                            fail && fail.call(elem, { code: 4, msg: '服务器返回异常' }, file);
                        }
                        lock = false;
                        if (progress)
                            progress.call(elem, 0);
                    }
                };
                xhr.send(data);
            });
        };
    so.upload = Upload;
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("upload", [], function () { });
    }
})(window);