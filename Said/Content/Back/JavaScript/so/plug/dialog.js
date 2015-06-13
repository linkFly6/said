/**
 * dialog.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * support:IE10+ & modern
 * 
 * Fork from dialogFx.js：http://tympanus.net/codrops/2014/12/08/inspiration-dialog-effects/
 * Copyright 2015, linkFly
 */
'use strict';
(function (global, factory) {
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
    var strundefined = typeof void (0),
        so = window.so,
        slice = Array.prototype.slice,
        each = Array.prototype.forEach,
        dialogClassName = '__dialog',
        document = window.document,
        defaultOptions = {
            text: '',
            zIndex: 4,
            textOK: '确定',
            textCancel: '取消',
            className: '',
            once: false,
            btns: '<div class="dialog-btns">\
                            <a href="javascript:;" class="dialog-btn-ok">${textOK}</a><a href="javascript:;" class="dialog-btn-cancel">${textCancel}</a>\
                    </div>'
        },
        globalTemplate = '<div class="__dialog ${className}" style="display:none;z-index:${zIndex}">\
                <div class="dialog-mask"></div>\
                <div class="dialog-content">\
                    <div class="dialog-morph-shape">\
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 560 280" preserveAspectRatio="none">\
                            <rect x="3" y="3" fill="none" width="556" height="276" />\
                        </svg>\
                    </div>\
                    <div class="dialog-inner">\
                        <div class="dialog-text">${text}</div>\
                        ${btns}\
                        </div></div></div>';
    /*
        css3支持嗅探代码摘自：modernizr.js
        github:https://github.com/Modernizr/Modernizr
    */
    var animEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
        styleSheets = document.createElement('div').style,
        animEndEventName,
        onEndTransition = function (el, callback) {
            var onEndCallbackFn = function (ev) {
                if (animEndEventName) {
                    if (ev.target != this) return;
                    this.removeEventListener(animEndEventName, onEndCallbackFn);
                }
                if (callback && typeof callback === 'function') { callback.call(); }
            };
            if (animEndEventName) {
                el.addEventListener(animEndEventName, onEndCallbackFn);
            } else {
                setTimeout(function () {
                    onEndCallbackFn();
                }, 800);
            }
        };

    for (var name in animEndEventNames) {
        if (styleSheets[name] !== undefined) {
            animEndEventName = animEndEventNames[name];
            break;
        }
    }


    /**
     * 弹窗组件，依赖于so.js
     *
     * @constructs Dialog(string[,object]) - 传入弹窗显示的文本
     * @constructs Dialog(elem[,object]) - 传入弹窗里的DOM
     * @constructs Dialog(object) - 传入Dialog对象的配置
     *
     * @param {( string | elem | object )} elem - 参见@constructs
     * @param {object=} [options=object] - 配置
     * @param {string} [options.text=""] - 弹窗显示的文本
     * @param {int} [options.zIndex=4] - 弹窗的z-index
     * @param {string} [options.textOK="确定"] - 弹窗"确定"按钮
     * @param {string} [options.textCancel="取消"] - 弹窗"取消"按钮
     * @param {boolean} [options.once=false] - 弹窗对象是否是一次性的，如果为true，则弹窗对象/DOM隐藏后就会被摧毁，且对象不再可以使用
     * @param {function} options.ok - 点击"确定"后执行的函数
     * @param {function} options.cancel - 点击"取消"后执行的函数
     * @return { Dialog }
     */
    var Dialog = function (elem, options) {
        /*
            支持3种API：
            Dialog(String)
            Dialog(options)
            Dialog(elem,options)
        */

        if (!(this instanceof Dialog)) return new Dialog(elem, options);
        this.events = {
            //成功函数列表
            ok: null,
            //取消函数列表
            cancel: null
        };

        /// Dialog对象的配置:
        /// &#10;  [text=""] - 弹窗显示的文本
        /// &#10;  [zIndex=4] - 弹窗的z-index
        /// &#10;  [textOK="确定"] - 弹窗"确定"按钮
        /// &#10;  [textCancel="取消"] - 弹窗"取消"按钮
        /// &#10;  [once=false] - 弹窗对象是否是一次性的，如果为true，则弹窗对象/DOM隐藏后就会被摧毁，且对象不再可以使用
        /// &#10;  options.ok - 点击"确定"后执行的函数
        /// &#10;  options.cancel - 点击"取消"后执行的函数
        this.options = so.extend({}, defaultOptions);
        var elemType = so.type(elem),
            isNode = elem && elem.nodeType === 1,
            template = globalTemplate;
        if (elemType === 'string') {
            this.options.text = elem;
        } else if (elemType === 'object' && !isNode) {
            options = elem;
            elem = null;
        }
        options && so.extend(this.options, options);
        if (!this.options.btns) {
            this.options.btns = '';
        } else
            template = template.replace('${btns}', this.options.btns);
        template = so.format(template, this.options);

        this.options.className = dialogClassName + ' ' + (this.options.className ? this.options.className : '');

        console.log(this.options.className);

        if (isNode) {//Dialog(elem,options)
            template = template.replace('${text}', '');
            if (~elem.className.indexOf(dialogClassName))
                this.elem = elem;
            else {
                this.elem = so.parseHTML(template)[0];
                elem.parentNode.insertBefore(this.elem, elem);
                this.body = this.elem.getElementsByClassName('dialog-text')[0];
                this.body.appendChild(elem);
            }
        } else {//Dialog(String)、Dialog(options)
            this.elem = so.parseHTML(template)[0];
            document.body.appendChild(this.elem);
        }
        this.body = this.body || this.elem.getElementsByClassName('dialog-text')[0];
        this.on(this.options.ok, this.options.cancel)._init();
    };

    Dialog.prototype._init = function () {
        var self = this,
            hash = ['ok', 'cancel'];
        this.elem.firstElementChild.addEventListener('click', function (e) {
            self.events.cancel && self.events.cancel(e);
            self.toggle(false);
        });
        if (self.options.btns)
            each.call(this.elem.getElementsByClassName('dialog-btns')[0].children, function (a, i) {
                a.addEventListener('click', function (e) {
                    self.events[hash[i]] && self.events[hash[i]](e);
                    self.toggle(false);
                });
            });

    };




    //对象是否当前显示
    Dialog.prototype.isOpen = false;




    ///<summary>
    /// destroy() - 摧毁这个Dialog对象和DOM
    /// </summary>
    Dialog.prototype.destroy = function () {
        this.elem && this.elem.parentNode.removeChild(this.elem);
        this.elem = null;
    };


    ///<summary>
    /// toggle([isOpen]) - 切换（显示/隐藏）这个Dialog的状态
    /// </summary>
    /// <param name="isOpen" type="boolean">
    /// 手动更改这个对象Dialog对象的状态
    /// </param>
    /// <returns type="Dialog" />
    Dialog.prototype.toggle = function (isOpen) {
        var self = this,
            elem = self.elem,
            className = self.options.className;
        if (!elem) return;
        if (isOpen != null)
            this.isOpen = !isOpen;
        if (this.isOpen) {
            //这里的查找要优化
            onEndTransition(self.mask || (self.mask = elem.querySelector('.dialog-mask')), function () {
                if (self.options.once) {
                    self.destroy();
                    return;
                }
                elem.style.display = 'none';
                self.isOpen = false;
            });
            elem.className = className;
        } else {
            elem.style.display = '';
            self.isOpen = true;
            setTimeout(function () {
                elem.className = className + ' dialog-open';
            });
        }
        return this;
    };

    ///<summary>
    /// 重新构建Dialog对象的文本
    /// &#10; 1.1 - text(text) - 重新放入文本
    /// &#10; 1.2 - text(elem) - 重新放入DOM元素
    /// </summary>
    /// <param name="text" type="String">
    /// 重新放入的文本或DOM元素
    /// </param>
    /// <returns type="Dialog" />
    Dialog.prototype.text = function (text) {
        if (text == null) return this;
        if (typeof text === 'string')
            this.body.innerHTML = text;
        else if (text.nodeType === 1) {
            this.body.innerHTML = '';
            this.body.appendChild(text);
        }
        return this;
    };

    ///<summary>
    /// 为Dialog委托函数，注意，新的回调函数会重写当前Dialog对象的回调函数
    /// &#10; 1.1 - on(string,function) - 传入相应状态的函数，状态标记为"ok"或"cancel"
    /// &#10; 1.2 - on(function[,function]) - 传入点击"确定"后执行的回调函数和点击"取消"后的回调函数，后者可略
    /// </summary>
    /// <param name="ok" type="string">
    /// 传入相应的状态字符串（"ok"或"cancel"），或直接传入成功后执行的回调函数
    /// </param>
    /// <param name="cancel" type="function">
    /// 委托的回调函数，或失败的回调函数
    /// </param>
    /// <returns type="Dialog" />
    Dialog.prototype.on = function (ok, cancel) {
        var arg1Type = so.type(ok),
            arg2Type = so.type(cancel);
        if (arg1Type === 'function') {
            this.events.ok = ok.bind(this.elem);
            if (arg2Type === 'function')
                this.events.cancel = cancel.bind(this.elem);
        } else if (arg1Type === 'string' && arg2Type === 'function')
            this.events[ok] = cancel.bind(this.elem);
        return this;
    };

    "show hide".split(' ').forEach(function (name, index) {
        Dialog.prototype[name] = function () {
            return this.toggle(!index);
        };
    });

    //兼容amd
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return Dialog;
        });
    } else if (typeof noGlobal === strundefined) {
        window.dialog = Dialog;
    }
});