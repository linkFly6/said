(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;
    var so = window.so,
        templent = '<div class="showmsg-container">\
            <div class="showmsg-mask"></div>\
                <div class="showmsg-content">\
                    <img class="showmsg-state" src="~/Content/Back/Images/showMsg/ok.png" />\
                <div class="showmsg-context">${0}</div></div></div>',
        globalConfig = {
            cache: true,//是否缓存这次结果
            title: null,
            context: null,
            //width: 320,
            height: 'auto',
            placement: 'auto',//top | bottom | left | right | auto
            close: 'auto'
        },
        timeout = function (callback, time, data) {
            var id = setTimeout(function () {
                callback(data);
                clearTimeout(id);
            }, time);
            return id;
        },
        append = function () {
            var body = window.document.body;
            return function (elem) {
                body.appendChild(elem);
            }
        }(),
        parseHTML = function (html) {
            var doc = document.createElement('div');
            doc.innerHTML = html;
            return doc.firstElementChild;
        },
        State = {
            OK: 0,
            ERROR: 1,
            WARNING: 2
        };
    var ShowMsg = function (text, state, time) {
        if (!text) return;
        var html = [];
    };
    window.showMsg = ShowMsg;
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("showMsg", ['so'], function () { });
    }
})(window);