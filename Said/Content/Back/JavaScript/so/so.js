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
    var toString = Object.prototype.toString,
		each = Array.prototype.forEach,
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        push = Array.prototype.push,
        isArray = Array.isArray,
        so = function (selector) {
            if (!(this instanceof so))
                return new so(selector);
            if (type(selector) === 'string') selector = document.getElementById(selector);
            if (selector && (selector.nodeType === 1 || selector.nodeType === 9))
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
    'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach(function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

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
    so.extend({
        //基础函数
        isFunction: isFunction,
        isWindow: isWindow,
        isDocument: isDocument,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isEmptyObject: isEmptyObject,
        isArrayLike: isArrayLike,
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
            var array = Array.prototype.slice.call(arguments, 1);
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
        }(window.location.search)
    });
    //event
    so.extend({
        on: function () {

        },
    });
    /*浏览器特性支持模块*/
    var Support = {
        localStorage: !!window.localStorage
    };
    /*DataBase模块*/
    var localStorage = window.localStorage,
        rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,//检测是否是json对象格式
        DataBase = function (namespace) {
            //修正命名空间
            if (!namespace)
                namespace = '';
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
                            rbrace.test(value) ? so.parseJSON(value) :
                            value;
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
    so.extend({
        DataBase: DataBase
    });



    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("so", [], function () {
            return so;
        });
    }
    if (typeof noGlobal === undefined) {
        window.so = so;
    }
    return so;
});
