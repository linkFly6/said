(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;
    var $ = window.jQuery,
        so = window.so,
        templent = '<div class="popup-content" style="display:none;">${0}<div class="popup-context">${1}</div></div>',
        globalConfig = {
            cache: true,//是否缓存这次结果
            title: null,
            context: null,
            //width: 320,
            height: 'auto',
            placement: 'auto',//top | bottom | left | right | auto
            close: 'auto'
        },
        guid = function () {
            return new Date() - 0;
        },
        cache = {},
        Popup = function ($elem, option) {
            var _self = this,
                config = _self.config = $.extend({}, globalConfig, option);//配置
            _self.$container = $($elem[0].ownerDocument.body);//追加的容器
            _self.$elem = $elem;
            _self.set(config.title, config.context);
            if (config.width) {
                _self.$context.css('width', config.width);
            }
        };
    $.extend(Popup.prototype, {
        _trigger: function (event, data) {
            this.$elem.trigger(event + '.popup', data);
        },
        _pos: function (placement) {
            var position = this.$elem.offset(),
                height = this.$elem.height(),
                arrowLeft = this.$elem.width() / 2;//arrow的宽度是20px
            this.$context.css({ left: position.left, top: position.top + height + 22 });
            this.$arrow.css('left', arrowLeft);
        },
        append: function () {
            this.$container.append(this.$content);
            return this.$content;
        },
        remove: function () {
            return this.$content.detach();
        },
        set: function (title, context) {
            var html = [],
                _self = this,
                config = this.config;//生成的pop组件HTML
            if (!context) {
                context = title;
                title = null;
            }
            if (!title && context && _self.context) {
                typeof context === 'string' ?
                _self.$body.html(context) :
                _self.$body.empty().append(context);
            } else {
                _self.destroy();
                title ?
                    html.push('<div class="pupup-arrow arrow-flag"></div><div class="popup-title"><span class="pupup-close"></span>', config.title, '</div>') :
                    html.push('<div class="pupup-arrow"></div>');
                html.push('<div class="popup-body"></div>');
                _self.$content = $(
                    so.format(templent,
                    config.close === 'auto' ?
                        '<div class="popup-mask"></div>' : '',
                    html.join('')));
                //这里的查找结果是popup-body
                _self.$context = $(_self.$content.find('.popup-context'));
                _self.$body = $(_self.$context[0].lastElementChild).append(context);
                _self.$arrow = $(this.$context[0].firstElementChild);
                if (config.close === 'auto') {
                    _self.mask = _self.$content.find('.popup-mask').on('click.popup.mask', function () {
                        _self.hide();
                    });
                }
                if (title)
                    _self.$content.find('.pupup-close').on('click.popup.close', function () {
                        _self.hide();
                    });
                if (config.cache)
                    _self.append();
            }
        },
        show: function () {
            this._pos();
            this._trigger('show');
            return this.config.cache ?
                this.$content.show() :
                this.append().show();
        },
        hide: function () {
            this._trigger('hide');
            return this.config.cache ?
                this.$content.hide() :
                this.remove().hide();
        },
        destroy: function () {
            if (this.$content) {
                this.$content.remove();
                this.$content = this.$container = null;
            }
        }
    });
    $.fn.popup = function (options) {
        var data = this.data('so.popup'),
            optionType = typeof options;
        if (!data) {
            this.data('so.popup', data = new Popup(this, options));
            this.on('click.popup', function () {
                data.show();
            });
        }
        if (optionType === 'string') {
            if (so.isFunction(data[options]))
                data[options]();
        }
        return this;
    };
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("popup", ['jquery'], function () { });
    }
})(window);