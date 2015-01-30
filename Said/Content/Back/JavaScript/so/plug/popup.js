(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;
    var so = window.so,
        templent = '<div class="popup-content">\
                    <div class="popup-mask"></div>\
                            <div class="popup-context">\
                                <div class="pupup-arrow"></div>\
                                <div class="popup-title"></div>\
                                <div class="popup-body"></div></div></div>',
        globalConfig = {
            cache: false,//是否缓存这次结果
            title: null,
            context: null,
            elem: null
        },
        guid = function () {
            return new Date() - 0;
        },
        cache = {},
        content = window.document.body,
        Popup = function (elem, option) {
            elem = so.find(elem);
            var config = so.extend({}, globalConfig, option),
                position = so.offset(elem),
                body = so.find(config.elem),
                context, key = elem.dataset['popup-id'];
            if (!body) return this;
            if (!key) {
                elem.dataset['popup-id'] = key = guid();
                content.insertAdjacentHTML('beforeEnd', templent);
                context = content.lastElementChild;
                content.appendChild(body);
            } else {
                //有缓存
                context = cache[key];
            }
            //处理位置等
            var pupMask = content.firstElementChild,
                pupBody = content.lastElementChild;
            //还没有计算元素宽高
            pupBody.style.left = position.left + 'px';
            pupBody.style.right = position.right + 'px';
        };
    so.extend(Popup.prototype, {

    });
    so.popup = Popup;
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("popup", [], function () { });
    }
})(window);