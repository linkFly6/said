define(['jquery', 'avalon'], function ($, avalon) {
    var globalTemplate = '<div class="OPTION_CONTAINER_CLASS" style="position:relative;ZINDEX"><div class="OPTION_BODY" >\
                        <div class="OPTION_SELECTED" ms-visible="isMultiple&&values.length">\
                            <label ms-repeat-item="values"><span>{{item}}</span><a class="OPTION_VALUESITEM" href="javascript:;" ms-click="removeClick($index)">×</a></label>\
                        </div></div>\
                        <div style="position:relative;"><div class="OPTION_QUERYSELECT" style="position:absolute;top:1px;" ms-visible="filters.length">\
                            <a class="OPTION_ITEM" href="javascript:;" ms-repeat-item="filters" ms-class="active:$index==activeIndex"  ms-click="itemClick($index)">{{item}}</a>\
                        </div></div></div>';
    var widget = avalon.ui.groupInput = function (elem, data, vms) {
        var options = data.groupInputOptions,
            datas = data.groupInputOptions.datas,
            callback = options.callback,
            trim = String.prototype.trim,
            $containerDOM,
            viewModel, $elem = $(elem),
            stop = function (e) {
                e.preventDefault();
            },
            len;
        $containerDOM = $(globalTemplate.replace('OPTION_CONTAINER_CLASS', options.classContaier || '')
                                    .replace('OPTION_BODY', options.classbody)
                                    .replace('ZINDEX', options.zIndex > 0 ? 'z-index:' + options.zIndex + '' : '')
                                    .replace('OPTION_SELECTED', options.classSelected || '')
                                    .replace('OPTION_VALUESITEM', options.classValuesItem || '')
                                    .replace('OPTION_BODY', options.classbody || '')
                                    .replace('OPTION_QUERYSELECT', options.classQuerySelect || '')
                                    .replace('OPTION_ITEM', options.classSelectItem || ''));
        viewModel = avalon.define(data.groupInputId, function (vm) {
            var isMultiple = options.multiple, acceptCustom = options.custom;
            /*tag逻辑*/
            vm.values = [];
            vm.isMultiple = isMultiple;
            if (isMultiple) {
                if (Array.isArray(options.values))
                    //TODO 要过滤外面给进来的不正确的数组（例如重复值）
                    vm.values = options.values.filter(function (item) {
                        return String(item).length > 0;
                    });
                vm.removeClick = function (index) {
                    vm.values.splice(index, 1);
                };
            }
            /*下拉框逻辑*/
            var reset = function (isClear) {
                if (isClear === true) {
                    vm.filters.splice(0, vm.filters.length);
                    len = 0;
                }
                vm.activeIndex = -1;
            },
                checkCustomInput = function () {
                    if (!acceptCustom && elem.value.trim().length && !~datas.indexOf(elem.value.trim()))
                        elem.value = '';
                };
            vm.filters = [];
            vm.vals = function (index) {
                var value = typeof index === 'number' ?
                    vm.filters[index] :
                    acceptCustom ? index : '';
                //TODO 去重处理？
                value && vm.values.push(value);
                elem.value = isMultiple || !value ? '' : value;
            };
            //通知回调函数
            if ($.isFunction(callback) && vm.values.$watch)
                vm.values.$watch('length', function () {
                    callback.call(elem, isMultiple ? vm.values : vm.values[0]);
                });

            if (datas && datas.length) {
                vm.activeIndex = -1;
                vm.query = function (value) {
                    value = value.toLowerCase();
                    this.filters = value == '' ? [] :
                        datas.filter(value.trim() === '' ?
                        function (item) {
                            return !~vm.values.indexOf(item);
                        } : function (item) {
                            return ~item.toLowerCase().indexOf(value) && !~vm.values.indexOf(item);
                        }).splice(0, 10);
                    len = this.filters.length;
                    reset();
                };
                vm.itemClick = function (index) {
                    vm.vals(index);
                    reset(true);
                    elem.focus();
                };
            }
            vm.$init = function () {
                elem.msRetain = true;
                $elem.before($containerDOM);
                $containerDOM[0].firstElementChild.appendChild(elem);
                elem.msRetain = false;
                $elem.on('keydown', function (e) {
                    switch (e.keyCode) {
                        case 40: {//down
                            stop(e);//在输入框文本极端（左右）的时候，会移动焦点，阻止这一浏览器行为
                            if (!len) return;
                            if (vm.activeIndex === len) vm.activeIndex = -1;
                            if (vm.activeIndex + 1 >= len) return vm.activeIndex = -1;
                            vm.activeIndex++;
                        } break;
                        case 38: {//up
                            stop(e);
                            if (!len) return;
                            if (vm.activeIndex === -1) vm.activeIndex = len;
                            if (vm.activeIndex - 1 < 0) return vm.activeIndex = len;
                            vm.activeIndex--;
                        } break;
                        case 27: {//esc
                            reset(true);
                            checkCustomInput();
                        } break;
                        case 13: {//enter
                            stop(e);//防止表单提交
                            e.stopPropagation();
                            if (!~vm.activeIndex) return false;
                            vm.vals(vm.activeIndex);
                            reset(true);
                        } break;
                        default:
                            reset();
                            break;
                    }
                });
                if (data && data.length)
                    $elem.on('input', function () {
                        vm.query(this.value);
                    })

                //.on('blur', function () {
                //    reset();
                //});

                if (isMultiple) {
                    $elem.on('keydown', function (e) {
                        switch (e.keyCode) {
                            case 9://tab
                                //case 188://,
                                //case 190://.
                                {
                                    e.preventDefault();
                                    vm.vals(trim.call(elem.value));
                                } break;
                            case 8: {//backSpace
                                if (vm.values.length && elem.value === '')
                                    vm.values.pop();
                            }
                                break;
                        }
                    });
                }

                //这里好纠结啊，为elem注册blur，firefox下blur触发在content.click之前，所以要给document下注册事件，法克...
                window.document.addEventListener('click', function (e) {
                    if (!$containerDOM[0].contains(e.target)) {
                        reset(true);
                        checkCustomInput();
                    }
                });


                /*
                    不能用avalon.scan()和avalon.scan($containerDOM[0],viewModel)
                    要把过去avalon binding的model给绑定上来，否则这个widget就会覆盖掉页面上默认binding的行为
                    参见：http://www.avalon.org.cn/art/552fb77d36803503a50000a4?number=20&from=0
                */
                avalon.scan($containerDOM[0], [viewModel].concat(vms));
            };
            vm.$remove = function () {
                $containerDOM.remove();
                $containerDOM = null;
            };

        });
        return viewModel;
    };
    widget.defaults = {
        getTemplate: function (tmp) {
            //可有可无，用户自己配置模板
            return tmp;
        },
        classContaier: 'queryInputBar form-control',
        classbody: 'input-body',
        classSelected: 'tag-selected',
        classValuesItem: 'tag-selectItem',
        classQuerySelect: 'querySelect',
        classSelectItem: 'select-item',
        //callbck: function (values) {
        //    return values;
        //},
        multiple: false,
        custom: true,
        values: [],
        datas: [],
        zIndex: -1
    };
    return widget;
});


