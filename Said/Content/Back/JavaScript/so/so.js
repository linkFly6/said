'use strict';
(function (global, factory) {
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("so", [], function () {
            return factory(window);
        });
    } else if (typeof module === "object" && typeof module.exports === "object") {
        //兼容node/commonJs
        module.exports = global.document ?
			factory(global, true) :
			function (w) {
			    if (!w.document) {
			        throw new Error("so requires a window with a document");
			    }
			    return factory(w);
			};
    } else {
        factory(global);
    }
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {

    //so的核心是提供工具，核心应该是提供静态方法，而对象方法只是馈赠

    var strundefined = typeof void (0),
        rword = ' ',
        toString = Object.prototype.toString,
		each = Array.prototype.forEach,
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        push = Array.prototype.push,
        isArray = Array.isArray,

        //耐压缩
        escape = encodeURIComponent,
        descape = decodeURIComponent,

        so = function (selector) {
            if (!(this instanceof so))
                return new so(selector);
            selector = so.find(selector);
            if (selector)
                push.call(this, selector);
        },
        type = function (obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object";
        },
    class2type = Object.create(null);
    function isFunction(value) { return type(value) == "function" }
    function isWindow(obj) { return obj != null && obj == obj.window }
    function isDocument(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
    function isObject(obj) { return type(obj) == "object" }
    function isPlainObject(obj) {//判断是否是纯粹的js对象
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }
    function isEmptyObject(obj) {//判断对象是否为空
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    }
    function isArrayLike(obj) {
        if (obj == null) return false;
        var length = obj.length, t = type(obj);
        return t === 'array' || !isFunction(obj) &&
		t !== 'string' && //解决TypeError：invalid 'in' operand obj，字符串不允许使用in
        (+length === length && //正数
        !(length % 1) && //整数
        (length - 1) in obj); //可以被索引
    }
    'Boolean Number String Function Array Date RegExp Object Error'.split(rword).forEach(function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });


    /*
        内部工具函数
    */
    //给数字字符串补零，不支持负数
    function padNumber(num, fill) {
        //改自：http://blog.csdn.net/aimingoo/article/details/4492592
        var len = ('' + num).length;
        return (Array(
            fill > len ? fill - len + 1 || 0 : 0
            ).join(0) + num);
    }

    so.extend = so.prototype.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (isPlainObject(copy) ||
                    (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }
                        target[name] = so.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    so.prototype.extend({
        length: 0,
        each: function (callback) {
            return so.each(this, callback), this;
        },
        on: function (type, listaner) {
            if (!isFunction(listaner)) return this;
            this.each(function (elem, i) {
                elem.addEventListener(type, function (e) {
                    if (listaner.call(elem, e, i) === false) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
            return this;
        },
        off: function (type, listaner) {
            if (!isFunction(listaner)) return this;
            this.each(function (elem) {
                elem.body.removeEventListener(type, listaner);
            });
            return this;
        },
        //set/get attribute
        attr: function (name, value) {
            if (arguments.length === 1)
                return this[0] ? this[0].getAttribute(name) || '' : '';
            if (value == null)
                this.each(function (elem) {
                    elem.removeAttribute(name)
                });
            else
                this.each(function (elem) {
                    elem.setAttribute(name, value);
                });
            return this;
        }
    });


    /*===========================================================================基础模块===========================================================================*/

    so.extend({
        //基础函数
        isFunction: isFunction,
        isWindow: isWindow,
        isDocument: isDocument,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isEmptyObject: isEmptyObject,
        isArrayLike: isArrayLike,
        find: function (selector) {
            if (type(selector) === 'string') selector = document.getElementById(selector);
            if (selector && (selector.nodeType === 1 || selector.nodeType === 9))
                return selector;
        },
        isXML: function (doc) {
            return doc && doc.createElement && doc.createElement('P').nodeName !== doc.createElement('p').nodeName;
        },
        type: type,
        each: function (target, callback) {
            var i, key;
            if (isArrayLike(target)) {
                for (i = 0; i < target.length; i++)
                    if (callback.call(target[i], target[i], i) === false) return false;
            }
            else
                for (key in target)
                    if (callback.call(target, key, target[key]) === false) return false;
            return target;
        },
        map: function () {
            var res = [];
            so.each(arguments, function (arg) {
                if (isArray(arg))
                    res.concat(arg);
                else if (isArrayLike(arg))
                    so.each(arg, function (tmp) {
                        res.push(tmp);
                    });
                else if (arg != null)
                    res.push(arg);
            });
            return res;
        },
        merge: function (first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },
        toArray: function () {
            var res = [];
            each.call(arguments, function (arg) {
                if (isArray(arg))
                    res = res.concat(arg);
                else if (isArrayLike(arg))// 过去的条件 => || isObject(arg)是错误的
                    so.each(arg, function (tmp) {
                        res.push(tmp);
                    });
                else if (arg != null)
                    res.push(arg);
            });
            return res;
        },
        //模拟String.prototype.startsWith - ECMAScript 2015(ES6) 规范
        startsWith: function (subjectString, searchString, position) {
            position = position || 0;
            return subjectString.indexOf(searchString, position) === position;
        },
        endsWith: function (subjectString, searchString, position) {
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return !!~lastIndex && lastIndex === position;
        },
        //扩展函数
        format: function (str, object) {
            /// <summary>
            /// 1: format(str,object) - 格式化一组字符串，参阅C# string.format()
            /// &#10; 1.1 - format(str,object) - 通过对象格式化
            /// &#10; 1.2 - format(str,Array) - 通过数组格式化
            /// </summary>
            /// <param name="str" type="String">
            /// 格式化模板(字符串模板)
            /// </param>
            /// <param name="object" type="Object">
            /// Object:使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
            /// Array:使用数组格式化，模板中使用${Index}占位：${0},${1}
            /// </param>
            /// <returns type="String" />
            if (typeof str !== 'string') return '';
            var array = slice.call(arguments, 1);
            //可以被\符转义
            return str.replace(/\\?\${([^{}]+)\}/gm, function (match, key) {
                //匹配转义符"\"
                if (match.charAt(0) == '\\')
                    return match.slice(1);
                var index = Number(key);
                if (index >= 0)
                    return array[index];
                return object[key] !== undefined ? object[key] : match;
            });
        },
        /**
        * 编码一个对象，注意编码的对象如果有function也会被编码
        * so.param(obj)
        * so.param(obj, deep)
        * @param {object} obj - 要编码的对象
        * @param {boolean} [deep=true] - 是否深度编码（当一个对象包含子对象的时候，是否也编码这个子对象）
        * @returns {String}
        */
        param: function (obj, deep) {
            var res, name, value;
            if (!isObject(obj)) return obj;
            deep = deep == null ? true : deep;
            res = [];
            for (name in obj) {
                value = obj[name];
                if (deep && value && isPlainObject(value)) {
                    //value是一个对象
                    res.push(escape(name) + '=' + escape(so.param(value, deep)));

                } else if (value != null) //当值是null/undefined的时候不会追加到参数中
                    res.push(escape(name) + '=' + escape(value));
            }
            return res.join('&')/*.replace(/%20/g, '+')*/;//TODO需要测试后端是否支持这里的空格转+号
        },
        /**
        * 获取url中的参数
        * so.Search() - 动态获取当前url中的参数
        * so.Search(url) - 动态获取指定url的参数
        * @param {string} [url=window.location.search] - 要获取的url
        * @returns {string}
        */
        search: function (url) {
            //var search = function (url) {
            if (!url) url = window.location.search;
            url = ~url.indexOf('?') ? url.split('?')[1] : url;
            url = descape(url);
            var res = {},
                tmp,
                params = url.split('#')[0].split('&');
            params.forEach(function (str) {
                tmp = str.split('=');
                //%3D:=，是否支持深度解码
                res[tmp[0]] = tmp[1];
            });
            return res;
            //};
            //这里如果url有参数是name，那么贴到search就会报Function.prototype.name是只读属性的错误
            //return so.extend(search, search(url));
        },
        /**
        * 读取/设置cookie
        * TODO 后续支持object的设置和array的读取？
        * TODO 后续第三个参数支持为options，可以设置expires、path、domain、secure
        * so.cookie() - 读取全部cookie
        * so.cookie(name) - 读取cookie，读取的值会尝试自动转换
        * so.cookie(name, value) - 设置永久有效cookie
        * so.cookie(name, value, expiredays) - 设置cookie，并设置有效天数
        * so.cookie(name, value, expiredays, path) - 设置包含有效路径的cookie
        * so.cookie(name, value, expiredays, path, domain) - 设置包含域的cookie
        * @param {string} name - 读取/设置的cookie名称
        * @param {string} value - 设置的cookie值
        * @param {double} expiredays - 过期时间（天）
        * @returns {so|string}
        */
        cookie: function (name, value, expiredays, path, domain) {
            if (value != null) {//set
                var exdate = new Date;
                if (expiredays != null) {
                    exdate.setTime(exdate.getTime() + expiredays * 8.64e7);
                    //目前UTC已经取代GMT作为新的世界时间标准，使用toGMTString()和toUTCString()两种方法返回字符串的格式和内容均相同
                } else {
                    //默认设个10年的
                    exdate.setFullYear(exdate.getFullYear() + 10);
                }
                expiredays = ';expires=' + exdate.toUTCString();
                if (isObject(value) || isArray(value))
                    value = JSON.stringify(value);
                path = path || '/';
                domain = domain == null ? document.domain : domain;
                document.cookie = [name, "=", escape(value), expiredays, ";path=", path, ";domain=", domain].join('');
                return this;
            }
            //get
            var result = name ? null : {},
                cookies = document.cookie ? document.cookie.split('; ') : [],
                i = 0,
                length = cookies.length,
                parts,
                key,
                cookie;
            for (; i < length; i++) {
                parts = cookies[i].split('=');
                key = descape(parts.shift());
                cookie = descape(parts.join('='));
                if (key && key === name) return so.parseData(cookie);
                if (!name && cookie) result[key] = cookie;
            }
            return result == null ? '' : result;
            //return so.parseData(descape(getSubString(document.cookie, name + '=', ';')));
        },
        /**
        * so.cookie(name) - 移除一个cookie
        * @param {string} name - 移除的cookie名称
        * @returns {so}
        */
        removeCookie: function (name) {
            return so.cookie(name, '', -1);
        },
        getWindow: function (node) {
            var doc = node.ownerDocument || node;
            return doc.defaultView || doc.parentWindow;
        },
        offset: function (elem) {
            //来自司徒正妹的方法~~~
            var doc = elem.ownerDocument, pos = { left: 0, top: 0 };
            if (!doc)
                return elem;
            var box = elem.getBoundingClientRect(), win = getWindow(elem),
                root = doc.documentElement,
                clientTop = root.clientTop || 0,
                clientLeft = root.clientLeft || 0,
                scrollTop = win.pageXOffset || root.scrollTop,
                scrollLeft = win.pageXOffset || root.scrollLeft;
            pos.top = box.top + scrollTop - clientTop;
            pos.left = box.left + scrollLeft - clientLeft;
        },
        parseJSON: function (data) {
            try {
                return JSON.parse(data + "");
            } catch (e) {
                return null;
            }
        },
        now: Date.now || function () {
            return +new Date;
        }

    });

    //将HTML编码
    //so.escapeHTML = function (text) {
    //    if (typeof text == 'string') {
    //        return text
    //            .replace(/&/g, "&amp;")
    //            .replace(/</g, "&lt;")
    //            .replace(/>/g, "&gt;")
    //            .replace(/"/g, "&quot;")
    //            .replace(/'/g, "&#039;");
    //    }
    //    return text;
    //}
    var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        rnoalphanumeric = /([^\#-~| |!])/g;
    so.escapeHTML = function (str) {
        //将字符串经过 str 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt  => 摘自avalon
        return String(str).
                replace(/&/g, '&amp;').
                replace(rsurrogate, function (value) {
                    var hi = value.charCodeAt(0)
                    var low = value.charCodeAt(1)
                    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
                }).
                replace(rnoalphanumeric, function (value) {
                    return '&#' + value.charCodeAt(0) + ';'
                }).
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;')
    }

    /*parseHTML*/
    var rtagName = /<([\w:]+)/,
        rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rscriptType = /^$|\/(?:java|ecma)script/i,//检测是否匹配script标签的type
        tagHooks = new function () {// jshint ignore:line
            so.extend(this, {
                option: document.createElement("select"),
                thead: document.createElement("table"),
                td: document.createElement("tr"),
                area: document.createElement("map"),
                tr: document.createElement("tbody"),
                col: document.createElement("colgroup"),
                legend: document.createElement("fieldset"),
                _default: document.createElement("div"),
                "g": document.createElementNS("http://www.w3.org/2000/svg", "svg")
            })
            this.optgroup = this.option;
            this.tbody = this.tfoot = this.colgroup = this.caption = this.thead;
            this.th = this.td;
        };

    String("circle defs ellipse image line path polygon polyline rect symbol text use").replace(rword, function (tag) {
        tagHooks[tag] = tagHooks.g //处理SVG
    })
    so.parseHTML = function (html) {
        if (typeof html !== 'string') return [];
        html = html.replace(rxhtml, "<$1></$2>").trim();
        var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase(),
                //取得其标签名
                wrapper = tagHooks[tag] || tagHooks._default,
                fragment = document.createDocumentFragment(),
                firstChild, scripts;
        wrapper.innerHTML = html;
        //innerHTML script标签处理
        scripts = wrapper.getElementsByTagName("script");
        scripts.length && each.call(scripts, function (elem) {
            if (rscriptType.test(elem.type || ""))
                elem.parendNode.removeChild(elem);
        });
        return so.merge([], wrapper.childNodes);
    };

    //event
    so.extend({
        on: function (elem, event, fn) {
            if (!isFunction(fn)) return elem;
            isArrayLike(elem) ?
                each.call(elem, function (item, i) {
                    item.addEventListener(event, function (e) {
                        return fn.call(item, e, i);
                    });
                }) : elem.addEventListener(event, fn);
        },
        once: function () {

        }
    });

    ////获取歌曲文件时长
    //var getMusicFileDuration = function (size, kbps) {//[文件大小（mb）, 位率（KBPS）]
    //    var seconds = Math.round(size / kbps * 8);//歌曲时长 = 文件大小（mb）/ 位率（KBPS） * 8
    //    var date = new Date(2015, 1, 1, 0, 0, 0);
    //    date.setSeconds(seconds);
    //    console.log('文件时长： ' + seconds + ' s');
    //    console.log('时间（2015-01-01开始）', date);
    //};
    //getMusicFileDuration(3164.16, 128)


    /*===========================================================================date模块===========================================================================*/
    var _dateEnum = [2015, 1, 1, 0, 0, 0],
        //new Date(year, month, day, hours, minutes, seconds) 兼容性最佳
        _lockDate = new Date(_dateEnum[0], _dateEnum[1], _dateEnum[2], _dateEnum[3], _dateEnum[4], _dateEnum[5]),
        regTime = /(0\d|2[0-3])?:?(0\d|[1-5]\d):(0\d|[1-5]\d)/;
    so.extend({
        padNumber: padNumber,
        parseSeconds: function (value) {
            //转换一个时间到秒，例如：00:01:00 => 60
            var date = new Date(_dateEnum[0], _dateEnum[1], _dateEnum[2], _dateEnum[3], _dateEnum[4], _dateEnum[5]),
                res = regTime.test(value) && regTime.exec(value);
            if (res) {//["22:31:43", "22", "31", "43"]
                res[1] && date.setHours(res[1]);
                res[2] && date.setMinutes(res[2]);
                res[3] && date.setSeconds(res[3]);
                return (date - _lockDate) / 1000;
            }
            return 0;
        },
        //转换一个秒数到时间，例如：60 => 00:01:00
        parseTime: function (value, format) {
            var date = new Date(_dateEnum[0], _dateEnum[1], _dateEnum[2], _dateEnum[3], _dateEnum[4], _dateEnum[5]);
            date.setSeconds(value);
            return so.dateFormat(date, format || 'HH:mm:ss');
        },
        parseBit: function (value) {
            //转换一个字节单位到合适阅读的单位
            var radix = 1024;
            ['B', 'KB', 'MB', 'GB'].some(function (unitStr, i) {
                if (value < Math.pow(radix, i + 1)) {
                    value = (value / Math.pow(radix, i)).toFixed(2) + unitStr;
                    return true;
                }
            });
            return value;
        },
        //转换时间
        parseDate: function (jsonDate) {
            try {
                var type = so.type(jsonDate);
                if (type === 'date') return jsonDate;
                if (!jsonDate) return null;
                return new Date(type === 'number' ? jsonDate : parseInt(String(jsonDate).replace("/Date(", "").replace(")/", ""), 10));
            } catch (e) {
                return null;
            }
        },
        //json时间格式化为正常时间
        dateFormat: function (jsonDate, format) {
            /// <summary>
            /// 1: dataFormat(jsonDate,format) - 将json日期格式转换为正常格式，例：/Date(1420638776887)/
            /// &#10; 1.1 - dateFormat(String) - 将指定json格式的字符串转换为时间，并按照默认格式返回
            /// &#10; 1.2 - dateFormat(Date) - 将指定的时间转换为默认字符串格式返回
            /// &#10; 1.3 - dateFormat(String, String) - 转换json时间，并指定格式化字符串
            /// &#10; 1.4 - dateFormat(Date, String) - 参考如上
            /// </summary>
            /// <param name="jsonDate" type="String">
            /// json日期格式的字符串，或Date时间对象
            /// </param>
            /// <param name="format" type="String">
            /// 格式化字符串，自定义格式化时间字符串请参考MSDN - C# DateTime.ToString(String)：http://msdn.microsoft.com/zh-cn/library/8kb3ddd4.aspx
            /// &#10; 支持的字符串自定义格式如下：
            /// &#10; yyyy - 4位数年份，例如：2015
            /// &#10; MM - 2位数月份，自动补零，例：02
            /// &#10; M - 1位数月份，例：2
            /// &#10; dd - 2位数日期，例：08
            /// &#10; d - 1位数日期，例：8
            /// &#10; HH - 2位数24小时,例：3
            /// &#10; H - 1位数24小时,例：03
            /// &#10; hh - 2位数12小时,例：PM 08/AM 03
            /// &#10; h - 1位数12小时,例：AM 8/PM 3
            /// &#10; mm - 2位数分钟数,例：09
            /// &#10; m - 1位数分钟数,例：9
            /// &#10; ss - 2位数秒数,例：01
            /// &#10; s - 1位数秒数,例：1
            /// &#10; fff - 3位数毫秒,例：009
            /// &#10; f - 1位数毫秒,例：9
            /// </param>
            /// <returns type="String" />
            if (!format || so.type(format) !== 'string')
                format = 'yyyy-MM-dd HH:mm:ss';
            var date = so.parseDate(jsonDate);
            if (!date) return '';
            var month = date.getMonth() + 1,
                day = date.getDate(),
                hours = date.getHours(),
                hours12 = hours > 11 ? 'PM' + (hours - 12) : 'AM' + hours,//12小时制1位数
                hours12double = hours > 11 ? 'PM ' + padNumber(hours - 12, 2) : 'AM ' + padNumber(hours, 2),//12小时制2位数
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                milliseconds = date.getMilliseconds();
            return format
                .replace('yyyy', date.getFullYear())//4位数年份
                .replace('MM', padNumber(month, 2))//2位数月份
                .replace('M', padNumber(month, 2))//1位数月份
                .replace('dd', padNumber(day, 2))//2位数日期
                .replace('d', day)//1位数日期
                .replace('HH', padNumber(hours, 2))//24小时制2位数
                .replace('H', hours)//24小时制1位数
                .replace('hh', hours12double)//12小时制2位数
                .replace('h', hours12)//12小时制1位数
                .replace('mm', padNumber(minutes, 2))//2位分钟
                .replace('m', minutes)//1位分钟
                .replace('ss', padNumber(seconds, 2))//2位秒数
                .replace('s', seconds)//1位秒数
                .replace('fff', padNumber(milliseconds, 3))//3位数毫秒
                .replace('f', milliseconds)//1位数毫秒
            //未来是否支持星期（dddd作为星期）？加入第三个参数扩展格式化？可以自定义解析格式？
        },
        //时间转本地=>时间转=>2个小时前
        dateToLocal: function (oldDate, nowDate) {
            oldDate = so.parseDate(oldDate);
            nowDate = nowDate ? so.parseDate(nowDate) : new Date();
            var timeSpan = nowDate.getTime() - oldDate.getTime();
            if (!oldDate || !nowDate || timeSpan < 0)
                return '';
            if (timeSpan / 60000 < 1)//1分钟内
                return '刚才';
            if (timeSpan / 60000 < 60)//1m=6000ms
                return Math.floor(timeSpan / 60000) + '分钟前';
            if (timeSpan / 3600000 < 24)//1h=3600000ms
                return Math.floor(timeSpan / 3600000) + '小时前';
            if (timeSpan / 86400000 <= 3)//1day=86400000ms
                return Math.floor(timeSpan / 86400000) + '天前';
            return so.dateFormat(oldDate, 'yyyy年MM月dd日 HH:mm:ss');//完整的时间
        },
        /**
        * so.parseData(value) - 将一个字符串转换成相应的数据类型
        * @param {string} value - 要转换的字符串
        * @returns {object}
        */
        parseData: function (value) {
            //来自jQuery.data
            return value === "true" ? true :
                    value === "false" ? false :
                    value === "null" ? null :
                    +value + "" === value ? +value :
                    rbrace.test(value) ? so.parseJSON(value) || value :
                    value;
        },
        //模拟String.prototype.startsWith - ECMAScript 2015(ES6) 规范
        startsWith: function (subjectString, searchString, position) {
            position = position || 0;
            return subjectString.indexOf(searchString, position) === position;
        },
        endsWith: function (subjectString, searchString, position) {
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return !!~lastIndex && lastIndex === position;
        },
        /**
        * 函数节流 -  把原函数封装为拥有函数节流阀的函数，当重复调用函数，只有到达这个阀值（wait毫秒）才会执行
        * 引自underscore
        * @param {function} func - 回调函数
        * @param {int} wait - 阀值(ms)
        * @param {object} options = null - 想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}
        * @returns {function}
        */
        throttle: function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function () {
                previous = options.leading === false ? 0 : so.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function () {
                var now = so.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        /**
        * 函数节流 -  把原函数封装为拥有防反跳的函数，延迟函数的执行(wait毫秒)，当重复调用函数时候，只执行最后一个调用（在wait毫秒之后）
        * 引自backbone
        * @param {function} func - 回调函数
        * @param {int} wait - 参数
        * @param {object} immediate = false - 表示是否逆转调用时机，为true表示：wait毫秒内的多次调用，仅第一次生效
        * @returns {function}
        */
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;

            var later = function () {
                var last = so.now() - timestamp;

                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    }
                }
            };

            return function () {
                context = this;
                args = arguments;
                timestamp = so.now();
                var callNow = immediate && !timeout;
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };
        },


        /**
        * 封装一个函数，只有在运行了count次之后才有效果
        * 引自underscore
        * @param {int} count - 次数
        * @param {function} func - 回调函数
        * @param {object} $this = null - this
        * @returns {function}
        */
        after: function (count, func, $this) {
            $this = $this === undefined ? null : $this;
            return function () {
                if (--count < 1) {
                    return apply(func, arguments, $this);
                }
            };
        },
        /**
        * 封装一个函数，调用不超过count次
        * 引自underscore
        * @param {int} count - 次数
        * @param {function} func - 回调函数
        * @param {object} $this = null - this
        * @returns {function}
        */
        before: function (count, func, $this) {
            var memo;
            $this = $this === undefined ? null : $this;
            return function () {
                if (--count > 0) {
                    memo = apply(func, arguments, $this);
                }
                if (count <= 1) func = null;
                return memo;
            };
        },
        /**
        * 创建一个只能调用一次的函数。重复调用改进的方法也没有效果，只会返回第一次执行时的结果
        * 引自underscore
        * @param {function} func - 回调函数
        * @param {object} $this = null - this
        * @returns {function}
        */
        once: function (func, $this) {
            return so.before(2, func, $this);
        }
    });


    /*===========================================================================浏览器特性支持模块*===========================================================================*/
    var Support = {
        localStorage: !!window.localStorage
    };


    /*===========================================================================DataBase模块===========================================================================*/
    var localStorage = window.localStorage,
        rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,//检测是否是json对象格式
        Database = function (namespace) {
            if (!(this instanceof Database))
                return new Database(namespace);
            namespace = namespace || '';
            //修正命名空间
            if (namespace && namespace.charAt(namespace.length - 1) != '.')
                namespace += '.';
            this.namespace = namespace;
        };
    so.extend(Database.prototype, {
        //获取命名空间下的key
        _getKey: function (key) {
            if (!key) return key;
            return this.namespace + key;
        },
        /*
        * 获取/设置一个项到数据中心（不得包含javascript语句，例如含有js的HTML片段）
        * TODO - 后续尝试和cookie一样支持超时的设置？
        * TODO - 后续尝试array的读取？
        * Database.prototype.val(key) - 读取
        * Database.prototype.val(key, value) - 设置
        * Database.prototype.val(obj) - 设置一组
        * @param {string} key - key
        * @param {object} value - 值
        * @param {object} obj - 将一个对象存储到数据中心
        * @returns {so}
        */
        val: function (key, value) {
            if (isObject(key)) {//如果是object
                //set
                Object.keys(key).forEach(function (name) {
                    this.val(name, key[name]);
                }, this);
                return this;
            }
            var valueType;
            if (arguments.length > 1) {
                //set
                valueType = so.type(value);
                localStorage.setItem(this._getKey(key), valueType === 'array' || valueType === 'object' ? JSON.stringify(value) : value);
                return this;
            }
            //get
            return so.parseData(localStorage.getItem(this._getKey(key)));
        },

        /*
        * 移除一个/一组数据项，返回被移除的数据值
        * Database.prototype.remove(key) - 从数据中心移除一个数据
        * Database.prototype.remove(array) - 从数据中心移除一组数据
        * @param {string} key - 要移除的key
        * @param {Array} array - 要移除的一组key
        * @returns {object|array}
        */
        remove: function (key) {
            var res;
            if (isArray(key)) {
                //批量移除：key===['name1','name2']
                res = key.map(function (item) {
                    return this.remove(item);
                }, this);
                return res;
            };
            if (key) {
                key = this._getKey(key);
                res = localStorage.getItem(key);
                if (res) {
                    res = so.parseData(res);
                    localStorage.removeItem(key);
                }
                return res;
            }
            return '';
        },

        /*
        * Database.prototype.clear() - 清空一个数据中心
        */
        clear: function () {
            var nameSpace = this.namespace;
            var name, reg = new RegExp('^' + nameSpace), res = Object.create(null);
            for (var i = 0; i < localStorage.length; i++) {
                name = localStorage.key(i);
                if (reg.test(name)) {
                    i--;//removeItem了之后，索引不正确，修正索引
                    res[name] = so.parseData(localStorage[name]);
                    localStorage.removeItem(name);
                }
            }
            return res;
        }
    });

    Database.clear = window.localStorage.clear;
    so.extend({
        Database: Database
    });




    /*===========================================================================图片加载===========================================================================*/
    var imgConfig = {
        //src: '',//要加载的图片
        load: '/Content/Images/Said-Images-load.gif',//加载中显示
        error: '/Content/Images/img-failed.png',//加载失败显示
        //done: noop,
        //fail: noop
    };
    so.imgLoad = function (elem, options) {
        //image element
        if (so.isPlainObject(elem)) {//imgLoad(options)
            options = elem;
            elem = null;
        }
        options = so.extend({}, imgConfig, elem && elem.dataset, options);//支持dataset和传参配置
        var img = new Image();
        if (elem)
            elem.src = options.load;
        //img.complete
        img.onload = function () {
            if (elem) elem.src = options.src;
            if (isFunction(options.done)) options.done(options.src);
            img.onload = null;
        };
        img.onabort = img.onerror = function () {
            if (elem) elem.src = options.error;
            if (isFunction(options.fail)) options.fail(options.error);
            img.onabort = img.onerror = null;
        };
        img.src = options.src;
        if (img.complete)
            img.onload();
    };
    so.imgLoad.DEFAULTS = imgConfig;



    if (typeof noGlobal === strundefined) {
        window.so = so;
    }
    return so;
});
