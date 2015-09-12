define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div style="display:none;z-index:ZINDEX" class="popup-content CLASSNAME">\
        <div class="popup-mask" MASKVISIBILE    ms-click="close()"></div>\
        <div class="popup-context">\
            <div class="pupup-arrow" ms-class="arrow-flag:title" ms-css-left="left"></div>\
            <div class="popup-title" ms-visible="title"><i ms-class="{{icon}}" ms-visible="icon"></i>{{title}}<span class="pupup-close" ms-click="close()"></span></div>\
            <div class="popup-body"></div></div></div>',
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
            $elem = $(elem),
            $context = $(options.context),//内容
            context = $context[0],
            $content = $containerDOM.find('.popup-context'),//弹窗容器
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
                    $context.show(0);
                    if (options.width !== 'auto')
                        $context.width(options.width);
                    $elem.on('click.popup', function () {
                        if (!viewModel.visible) {//要显示
                            var position = $elem.offset(),
                                height = $elem.height(),
                                arrowLeft = $elem.width() / 2;//arrow的宽度是20px
                            $content.css({ left: position.left, top: position.top + height + 22 });
                            viewModel.left = arrowLeft;
                            $containerDOM.stop().fadeIn(100);
                            options.showHandle(viewModel);
                        } else {
                            viewModel.close();
                            options.hideHandle(viewModel);
                        }
                        viewModel.visible = !viewModel.visible;
                    });
                    if (options.autoClose) {
                        $context.find('.pupup-close').on('click.popup', function () {
                            viewModel.close();
                        });
                    }
                    options.root.appendChild($containerDOM[0]);
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


