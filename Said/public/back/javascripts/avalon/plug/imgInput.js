define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div class="imgInput-box">\
                    <img data-holder-rendered="true" src="" data-src="holder.js/100%x180" alt="img" />\
                    {{input}}</div>',
            noop = function () { },
        defaults = {
            cache: true,//是否缓存这次结果
            title: null,
            context: null,
            width: 'auto',
            height: 'auto',
            placement: 'auto',//top | bottom | left | right | auto
            classIcon: '',
            className: '',
            autoClose: false,
            title: '',
            zIndex: 1,
            root: document.body,
            showHandle: noop,
            hideHandle: noop
        };
    var widget = avalon.ui.popup = function (elem, data, vms) {
        var options = data.popupOptions,
            $containerDOM = $(template.replace('ZINDEX', options.zIndex)
                                      .replace('MASKVISIBILE', options.close === true ? 'style="display:none;"' : '')
                                      .replace('CLASSNAME', options.className)),
            viewModel = avalon.define({
                $id: data.popupId,
                left: 0,
                title: options.title,
                icon: options.classIcon,
                visible: false,
                close: function () {
                    $containerDOM.stop().fadeOut(100, function () {
                        viewModel.visible = false;
                        if (!options.cache)
                            viewModel.$remove();
                    });
                },
                $init: function () {
                    context.msRetain = true;
                    $containerDOM.find('.popup-body').append(context);
                    context.msRetain = false;
                    avalon.scan($containerDOM[0], [viewModel].concat(vms));
                },
                $remove: function () {
                    $containerDOM.remove();
                    $containerDOM = null;
                }
            });
        return viewModel;
    };
    widget.defaults = defaults;
    return widget;
});


