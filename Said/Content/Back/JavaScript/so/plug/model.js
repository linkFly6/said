'use strict';
define(['../so'], function (so) {
    /*
        其实现在只是操作form，未来会扩展到model上
        1、是否以后扩展到so的核心？ TODO
        2、尚未映射到未来还会通过改变DOM生成的对象
        4、未来可以把select映射成一个数组，访问select的时候是一个数组
        5、未来可以把radio映射成一个对象，访问radio的时候是一个对象，每个不同
     */
    var each = Array.prototype.forEach;
    var Model = function (formElem) {
        if (!(this instanceof Model))
            return new Model(formElem);
        if (so.type(formElem) === 'string') {
            formElem = window[formElem];//form可以直接在window的name下获取
            formElem = formElem || document.getElementById(formElem);
        }
        if (formElem.tagName !== 'FORM') return {};
        var elems = so.map(formElem.getElementsByTagName('input'), formElem.getElementsByTagName('textarea')),
            model = Object.create(null),
            radioCaches = Object.create(null), elements = {};
        elems.forEach(function (elem) {
            var name = elem.getAttribute('name'), type = elem.type, special = type === 'checkbox' || type === 'radio', get, set;
            if (!name) return;
            elements[name] = elem;
            //需要针对这些特殊的元素特殊搞定：input-type:radio、input-type:checkbox、select
            if (special) {
                //检测出按组(radio)提交值的数据，原型链则hasOwnProperty()
                switch (type) {
                    case 'checkbox': {
                        get = function () { return elem.checked; }
                        set = function (value) { elem.checked = !!value; }
                    } break;
                    case 'radio': {
                        if (name in radioCaches) {
                            radioCaches[name].push(elem);
                        } else {
                            radioCaches[name] = [elem];
                        }
                    } return;
                    case 'select':
                        get = function () { return elem.options[elem.options.selectIndex]; }
                        set = function (value) {
                            //支持value/text/index/null 四重set，其中set null是测试性功能
                            var len = elem.options.length, isNum = true;
                            if (value == null) isNum = false;//如果是null清空所有select，测试性功能
                            if (isNum && isNaN(value)) {
                                value = +value;
                                isNum = value >= 0 && value < len ? true : false;
                            }
                            if (isNum)
                                value = String(value);
                            each.call(elem.options, value == null ? function (option) {
                                option.selected = false;
                            } : isNum ? function (option, i) {
                                option.selected = i === value ? true : false;
                            } : function (option) {
                                option.selected = option.value === value || option.selected === value ? true : false;
                            });
                        }
                        break;
                }
            } else {
                get = function () { return elem.value; }
                set = function (value) { elem.value = value == null ? '' : value }
            }
            Object.defineProperty(model, name, {//支持动态访问
                enumerable: true,
                //writable:true,
                get: get,
                set: set
            });
        });
        if (!so.isPlainObject(radioCaches)) {//radio需要特殊处理
            so.each(radioCaches, function (name, radios) {
                var len = radios;
                Object.defineProperty(model, name, {
                    enumerable: true,
                    //writable: true,
                    get: function () {
                        var res = '';
                        $.each(radios, function (elem) {
                            if (elem.checked)
                                return res = elem.value, false;
                        });
                        return res;
                    },
                    set: function (value) {
                        var isNum = true;//放在闭包内让浏览器自动释放
                        if (value == null) isNum = false;//如果是null清空所有radio
                        if (isNum && isNaN(value)) {
                            value = +value;
                            isNum = value >= 0 && value < len ? true : false;
                        }
                        if (isNum)
                            value = String(value);
                        $.each(radios, value == null ?
                            function (elem) {
                                elem.checked = false;
                            } :
                            isNum ? function (elem, i) {
                                elem.checked = i === value ? true : false;
                            } :
                            function (elem, i) {
                                elem.checked = elem.value === value || elem.text === value ? true : false;
                            });
                    }
                });

            });
        }
        model.each = function (callback) {
            if (!so.isFunction(callback)) return model;
            so.each(model, function (name, value) {
                if (!so.isFunction(value))
                    return callback.call(model, name, value);
            });
            return model;

        };
        model.get = function (name) {
            return elements[name] || null;
        };
        model.serialize = function () {
            var res = Object.create(null);
            model.each(function (name, value) {
                res[name] = value;
            });
            return res;
        };
        return model;
    };
    return Model;
});