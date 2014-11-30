'use strict';
define(function () {

    var so = function () {

    };
    so.extend = so.fn.extend = function () {

    };
    so.extend({
        isXML: function () {

        },
        isArrayLike: function () {

        },
        each: function (target, callabck, args) {
            if (so.isFunction(target)) {//callabck[, args]，target is to this
                args = callabck;
                callabck = target;
                target = this;
            }
            //还要考虑支持对象的遍历
            for (var i = 0, len = target.length; i < len; i++)
                if (callabck.apply(target, args) === false) return false;
        }
    });
});