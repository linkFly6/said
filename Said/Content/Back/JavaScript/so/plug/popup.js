(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;
    var so = window.so,
        Popup = function (elem, option) {
            
        };
    so.extend(Popup.prototype, {

    });
    so.popup = Popup;
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("popup", [], function () { });
    }
})(window);