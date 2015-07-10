'use strict';
(function (global, factory) {
    //兼容node/commonJs
    if (typeof module === "object" && typeof module.exports === "object") {
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
        Parm: function (url) {
            var Parm = function (name) {
                /// <summary>
                /// 1: PageState.parm(name) - parm是一个对象，标识是当前url的参数信息，提供动态参数和静态参数的访问
                /// &#10; 1.1 - PageState.parm(name) - 动态获取当前url参数，它是实时的，当页面url利用pushState改变url的时候，它同样会更新相应的数据信息
                /// &#10; 1.1 - PageState.parm[name] - 静态获取当前url参数，它获取的数据是静态的，在页面初始化的时候就会得到并且未来不会改变
                /// </summary>
                /// <param name="name" type="String">
                /// 要获取的属性
                /// </param>
                /// <returns type="String" />
                //通过函数访问则动态获取
                url = window.location.search;
                return (name != null && name !== '' && url.indexOf('?') !== -1
                && (name = url.substr(1).match(new RegExp('(^|&)' + name + "=([^&]*)(&|$)"))) != null)
                ? name[2] : '';
            }, tmp;
            //通过对象访问则静态获取
            url.indexOf('?') !== -1 &&
            url.substr(1).split('&').forEach(function (str) {
                tmp = str.split('=');
                Parm[tmp[0]] = decodeURIComponent(tmp[1]);
            });
            tmp = null;
            return Parm;
        }(window.location.search),
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
        }
    });

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


    /*===========================================================================date模块===========================================================================*/
    so.extend({
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
        }
    });


    /*===========================================================================浏览器特性支持模块*===========================================================================*/
    var Support = {
        localStorage: !!window.localStorage
    };


    /*===========================================================================DataBase模块===========================================================================*/
    var localStorage = window.localStorage,
        rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,//检测是否是json对象格式
        getLocalStorageItem = function (value) {
            //来自jQuery的jQuery.data
            return value === "true" ? true :
                    value === "false" ? false :
                    value === "null" ? null :
                    +value + "" === value ? +value :
                    rbrace.test(value) ? so.parseJSON(value) :
                    value;
        },
        DataBase = function (namespace) {
            //修正命名空间
            namespace = namespace || '';
            if (namespace && namespace.charAt(namespace.length - 1) != '.')
                namespace += '.';
            var getKey = function (key) {
                if (!key) return key;
                return namespace + key;
            },
                support = Support.localStorage;
            return {
                support: support,
                val: function (key, value) {
                    //TODO 后续的val要强大的足够支持json
                    var valueType;
                    if (arguments.length > 1) {
                        //set
                        valueType = so.type(value);
                        if (support)
                            localStorage.setItem(getKey(key), valueType === 'array' || valueType === 'object' ? JSON.stringify(value) : value);
                        return this;
                    }
                    //get
                    return getLocalStorageItem(support ? localStorage.getItem(getKey(key), value) || '' : '');
                },
                remove: function (key) {
                    //TODO 后续的remove要支持多个参数key：['name1','name2']和多个参数remove('name1','name2')
                    if (support && key) {
                        key = getKey(key);
                        var res = getLocalStorageItem(key);
                        localStorage.removeItem(key);
                        return res;
                    }
                    return '';
                },
                clear: function (nameSpace) {
                    nameSpace = nameSpace || namespace;
                    var name, reg = new RegExp('\b' + nameSpace), res = Object.create(null);
                    for (var i = 0, len = localStorage.length; i < len; i++) {
                        if (reg.test((name = localStorage.key(i)))) {
                            res[name] = localStorage[name];
                            localStorage.removeItem(name);
                        }
                    }
                    return res;
                }
            };
        };
    DataBase.clear = window.localStorage.clear;
    so.extend({
        DataBase: DataBase
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
        if (typeof elem === 'object') {//imgLoad(options)
            options = elem;
            elem = null;
        }
        options = so.extend({}, IMGDEFAULTS, elem && elem.dataset, options);//支持dataset和传参配置
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




    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("so", [], function () {
            return so;
        });
    }
    if (typeof noGlobal === strundefined) {
        window.so = so;
    }
    return so;
});
