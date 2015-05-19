/**
 * dialog.js v1.0.0
  *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, linkFly
 * Fork from dialogFx.js：http://tympanus.net/codrops/2014/12/08/inspiration-dialog-effects/
 */
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

    var strundefined = typeof void (0),
        so = window.so,
        slice = Array.prototype.slice,
        each = Array.prototype.forEach,
        dialogClassName = '__dialog',
        document = window.document,
        defaultOptions = {
            //text: undefined,
            zIndex: 4,
            textOK: '确定',
            textCancel: '取消'
        },
        globalTemplate = '<div class="__dialog" style="display:none;z-index:${zIndex}">\
                <div class="dialog-mask"></div>\
                <div class="dialog-content">\
                    <div class="dialog-morph-shape">\
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 560 280" preserveAspectRatio="none">\
                            <rect x="3" y="3" fill="none" width="556" height="276" />\
                        </svg>\
                    </div>\
                    <div class="dialog-inner">\
                        <div class="dialog-text">${text}</div>\
                        <div class="dialog-btns">\
                            <a href="javascript:;" class="dialog-btn-ok">${textOK}</a><a href="javascript:;" class="dialog-btn-cancel">${textCancel}</a>\
                        </div></div></div></div>';
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
        if (styleSheets[name] !== undefined)
            animEndEventName = animEndEventNames[name];
    }
    var Dialog = function (elem, options) {
        /*
            支持3种API：
            Dialog(String)
            Dialog(options)
            Dialog(elem,options)
        */

        if (!(this instanceof Dialog)) return new Dialog(elem, options);
        var elemType = so.type(elem),
            isNode = elem && elem.nodeType === 1,
            template;
        if (elemType === 'string') {
            this.options.text = elem;
        } else if (elemType === 'object' && !isNode) {
            options = elem;
            elem = null;
        }
        options && so.extend(this.options, options);
        template = so.format(globalTemplate, this.options);

        if (isNode) {//Dialog(elem,options)
            template = template.replace('${text}', '');
            if (~elem.className.indexOf(dialogClassName))
                this.elem = elem;
            else {
                this.elem = so.parseHTML(template)[0];
                elem.parendNode.insertBefore(this.elem, elem);
                this.body = this.elem.getElementsByClassName('dialog-inner')[0];
                this.body.appendChild(elem);
            }
        } else {//Dialog(String)、Dialog(options)
            this.elem = so.parseHTML(template)[0];
            document.body.appendChild(this.elem);
        }
        this.body = this.body || this.elem.getElementsByClassName('dialog-inner');
        this.on(this.options.ok, this.options.cancel)._init();
    };

    Dialog.prototype._init = function () {
        var self = this,
            hash = ['ok', 'cancel'];
        this.elem.firstElementChild.addEventListener('click', function (e) {
            self.events.cancel.forEach(function (fn) {
                fn(e);
            });
            self.toggle(false);
        });
        each.call(this.elem.getElementsByClassName('dialog-btns')[0].children, function (a, i) {
            a.addEventListener('click', function (e) {
                self.events[hash[i]].forEach(function (fn) {
                    fn(e);
                });
                self.toggle(false);
            });
        });

    };

    Dialog.prototype.events = {
        ok: [],
        cancel: []
    };

    Dialog.prototype.isOpen = false;

    Dialog.prototype.options = defaultOptions;

    Dialog.prototype.destroy = function () {
        this.elem && this.elem.remove();
        this.elem = null;
    };


    Dialog.prototype.toggle = function (isOpen) {
        var self = this,
            elem = self.elem;
        if (!elem) return;
        if (this.isOpen) {
            elem.querySelector('.dialog-mask').addEventListener(animEndEventName, function () {
                elem.style.display = 'none';
                self.isOpen = false;
            });
            elem.className = dialogClassName;
        } else {
            elem.style.display = '';
            self.isOpen = true;
            setTimeout(function () {
                elem.className = '__dialog dialog-close dialog-open';
            });
        }
        return this;
    };

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

    Dialog.prototype.on = function (ok, cancel) {
        var arg1Type = so.type(ok),
            arg2Type = so.type(cancel);
        if (arg1Type === 'function') {
            this.events.ok.push(ok.bind(this.elem));
            if (arg2Type === 'function')
                this.events.cancel.push(cancel.bind(this.elem));
        } else if (arg1Type === 'string' && arg2Type === 'function')
            this.events[ok] && this.events[ok].push(cancel.bind(this.elem));
        return this;
    };

    //兼容amd
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return Dialog;
        });
    } else if (typeof noGlobal === strundefined) {
        window.dialog = Dialog;
    }
});