define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div class="OPTION_CONTAINER_CLASS">\
                        <div class="OPTION_SELECTED" ms-visible="values.length">\
                            <label ms-repeat-item="values"><span>{{item}}</span><a class="OPTION_ITEM_CLASS" href="javascript:;" ms-click="itemClick($index)">×</a></label>\
                        </div></div>',
        defaults = {};
    var widget = avalon.ui.groupInput = function (elem, data, vms) {
        //class queryInputBar tagInputBar form-control
        //tag-selected
        //_tag-selectItem
        var datas = data.grounpInputOptions.datas,
            options = data.grounpInputOptions,
            $containerDOM = $(template),
            viewModel, $elem = $(elem),
            stop = function (e) {
                e.preventDefault();
            },
            len;
        viewModel = avalon.define(data.autoCompleteId, function (vm) {
            vm.values = options.values || [];
            vm.itemClick = function (index) {
                vm.values.splice(index, 1);
            };

            vm.$init = function () {
                elem.msRetain = elem.parentNode.msRetain = true;
                elem.parentNode.insertBefore($containerDOM[0], elem);
                $containerDOM[0].insertBefore(elem, $containerDOM[0].firstElementChild)
                avalon.scan($containerDOM[0], [viewModel].concat(vms));
            };
            vm.$remove = function () {
                $containerDOM.remove();
                $containerDOM = $elem = null;
            };

        });
        return viewModel;
    };
    widget.defaults = {
        getTemplate: function (tmp) {
            //可有可无，用户自己配置模板
            return tmp;
        },
        classContaier: 'tagInputBar',
        classSelected: 'tag-selected',
        classItem: 'tag-selectItem',
        values: []
    };
    return widget;
});


