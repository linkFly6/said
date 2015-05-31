define(['jquery', 'avalon'], function ($, avalon) {
    var template = '',
        defaults = {
            cache: true,//是否缓存这次结果
            title: null,
            context: null,
            //width: 320,
            height: 'auto',
            placement: 'auto',//top | bottom | left | right | auto
            close: 'auto',
            uploadUrl: '',

            classIcon: 'icon-picture',
            textTitle: '请选择',
        };
    var widget = avalon.ui.popup = function (elem, data, vms) {
        var datas = data.popupOptions.datas,
            options = data.popupOptions,
            $containerDOM = $(template),
            viewModel, $elem = $(elem),
            cache = {};

        viewModel = avalon.define(data.popupId, function (vm) {

            vm.$init = function () {
                elem.msRetain = elem.parentNode.msRetain = true;
                elem.parentNode.insertBefore($containerDOM[0], elem);
                $containerDOM[0].insertBefore(elem, $containerDOM[0].firstElementChild)
                elem.msRetain = elem.parentNode.msRetain = false;
                avalon.scan($containerDOM[0], [viewModel].concat(vms));
            };
            vm.$remove = function () {
                $elem.remove();
                $elem = null;
            };

        });
        return viewModel;
    };
    return widget;
});


