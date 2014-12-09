'use strict';
define(['so'], function (so) {
    var globalAttrs = ['required', 'maxlength', 'minlength', 'reg', 'number', 'email', 'date', 'cn'],
        plainFn = function () { return true; },//默认方法
        validateTmp = {//方法的this都指向
            'required': function (value) {
                return value != null && value != '';
            },
            'maxlength': function (value, num) {
                return value > num;
            },
            'minlength': function (value, num) {
                return value < num;
            },
            'reg': function (value, reg) {
                return new RegExp(reg).test(value);
            },
            'num': function (value) {
                return /\d+/.test(value);
            },
            'email': function () {
                return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value);
            },
            'date': function (value) {
                return /((1|0?)[0-9]|2[0-3]):([0-5][0-9])/.test(value);
            },
            'cn': function (value) {
                return /[\u4e00-\u9fa5]/.test(value);
            },
            'checked': function (value) {//checkbox&radio
                return value === 'true' ? true : false;
            }
        },
    dataAttr = function (elem, callback) {
        //获取验证信息，返回一个动态的验证对象
        var res = {}, key;
        if (elem.getAttribute('data-validate') == null) {//空字符串和null的冲突，无法简写
            if (elem.getAttribute("validate") == null) return res;
        }
        so.each(elem.attributes, function (attr) {//HTML 4.1
            key = attr.name.replace('data-', '').toLowerCase();
            if (globalAttrs.indexOf(key) !== -1)
                res[key] = attr.value;
        });
        return res;
    };
    var Validate = function (formElem, listener) {
        /// <summary>
        /// 1: 创建一个表单验证对象，>IE9浏览器支持，本对象的核心在于验证成功和失败，但并不会对验证结果进行处理
        /// &#10;       返回的Validate对象映射着form内要求验证的元素，可以通过"Validate.元素名称（name）"得到相应元素的model，model都含有内置的验证方法，并还有val()[得到元素值]，test()[检测元素是否通过验证]等方法
        /// &#10;       Validate对象需要和HTML的结构配合使用，没有配置相关验证的元素并不会映射到Validate对象上验证，在要验证的元素上，加上data-validate或validate即可。
        /// &#10; 1.1 - Validate(name, listener) - 通过form name得到form
        /// &#10; 1.2 - Validate(id, listener) - 通过id得到form
        /// &#10; 1.3 - Validate(Element, listener) 通过form Element对象得到
        /// </summary>
        /// <param name="formElem" type="Element">
        /// *form的id、name或form元素
        /// </param>
        /// <param name="listener" type="Function">
        /// *listener会在每次用户输入的时候调用，传递的参数：[被验证的元素（Element），验证是否通过,验证的key，验证的值，key的值]，this指向当前被验证的模型（Model）
        /// </param>
        /// <returns type="Validate" />

        if (!(this instanceof Validate))
            return new Validate(formElem, listener);
        if (so.type(formElem) === 'string') {
            formElem = window[formElem];//form可以直接在window的name下获取
            formElem = formElem || document.getElementById(formElem);
        }
        if (formElem.tagName !== 'FORM') return;
        var elems = so.map(formElem.getElementsByTagName('input'), formElem.getElementsByTagName('textarea')),
            self = this, elemName;
        self.keys = [];
        if (!so.isFunction(listener)) return;
        elems.forEach(function (elem) {//循环表单项
            var attrs = dataAttr(elem), model;
            if (!so.isEmptyObject(attrs)) {//判定对象是否是空
                model = self[elemName = elem.getAttribute('name')] = {};//建立model => ：Validate.Said={};
                self.keys.push(elemName);
                model.element = elem;
                //动态扩展model
                model.keys = so.toArray(attrs);
                model.val = elem.type === 'checkbox' || elem.type === 'radio' ? function () {
                    if (value == null)
                        return elem.checked;
                    elem.checked = !!value;
                } : function (value) {
                    if (value == null)
                        return elem.value;
                    elem.value = value;
                };
                globalAttrs.forEach(function (name) {//为model扩展所有方法
                    if (attrs[name])//如果指定了该方法的验证，扩展model的正确验证方法
                        model[name] = function () {//扩展['required', 'maxlength', 'minlength', 'reg', 'number', 'email', 'date', 'cn' ]
                            return validateTmp[key](elem.value || elem.checked, attrs[name]);//需要兼容checkbox，但是兼容的并不好
                        }
                    else//否则使用空方法，该方法验证一直通过
                        model[name] = plainFn;
                });
                //扩展其他方法
                model.test = function (callback) {
                    var checkValue = elem.value || elem.checked, checkedResult = true;
                    return so.each(attrs, function (key, value) {
                        checkedResult = validateTmp[key](checkValue, value);//通过验证模板进行验证
                        callback.call(model, elem, checkedResult, key, checkValue, value);//(检测结果，检测的属性名，检测的值,检测的表达式)
                        return checkedResult;
                    });
                };
                //注册事件
                elem.addEventListener('input', function () {
                    return model.test(listener);//以后要支持侦听懒绑定，支持初始化完毕后绑定事件侦听
                });
            }
        });
    };
    Validate.extend = function (validate) {
        //扩展validate对象（影响后续生成的实例）
        so.each(validateTmp, function (key, fn) {
            if (!so.isFunction(fn)) return;
            key = String(key);
            globalAttrs[key] = key;
            validateTmp[key] = fn;
        });
    };
    so.extend(Validate.prototype, {
        each: function (callback) {//[key,model]，this同样指向model
            if (!so.isFunction(callback)) return this;
            var tmp, self = this;
            so.each(self.keys, function (key) {
                tmp = self[key];
                if (callback.call(tmp, key, tmp) === false) return false;
            });
            return this;
        },
        test: function (callback) {
            var res = true;
            this.each(function () {
                if (this.test(so.isFunction(callback) && callback) === false)
                    res = false;
            });
            return res;
        },
        serialize: function () {
            //通过验证的表单项得到一个纯净的JS对象
            var res = Object.create(null), tmp;
            this.each(function (key) {
                tmp = this.element;
                res[key] = tmp.value || tmp.checked;
            });
            return res;
        }
        //更多方法是在创建对象的时候动态扩展
    });
    return Validate;
});