define(['jquery', 'avalon', 'autoComplete'], function ($, avalon) {
    var template = '<div class="OPTION_CONTAINER_CLASS">\
                        <div class="OPTION_SELECTED" ms-visible="values.length">\
                            <label ms-repeat-item="values"><span>{{item}}</span><a class="OPTION_VALUESITEM" href="javascript:;" ms-click="removeClick($index)">×</a></label>\
                        </div>\
                        <div class="OPTION_QUERYSELECT" ms-visible="filters.length">\
                            <a class="OPTION_ITEM" href="javascript:;" ms-repeat-item="filter" ms-class="active:$index==activeIndex"  ms-click="itemClick($index)">{{item}}</a>\
                        </div></div>',
        defaults = {};
    var widget = avalon.ui.autoComplete = function (elem, data, vms) {
        var datas = data.autoCompleteOptions.datas,
            trim = String.prototype.trim,
            options = data.autoCompleteOptions,
            $containerDOM = $(template),
            viewModel, $elem = $(elem),
            stop = function (e) {
                e.preventDefault();
            },
            len;
        viewModel = avalon.define(data.autoCompleteId, function (vm) {
            /*tag逻辑*/
            if (vm.multiple) {
                vm.values = Array.isArray(options.values) ? options.values : [];
                vm.removeClick = function (index) {
                    vm.values.splice(index, 1);
                };

            }

            var test = false;
            test ? (test = 1, test = 2, test = 3)/*多行合并为一行*/ : (test = 0);


            /*下拉框逻辑*/
            var reset = function () {
                vm.filters.splice(0, vm.filters.length);
                vm.activeIndex = -1;
            };
            if (datas && datas.length) {
                vm.filter = [];
                vm.display = 'none';
                vm.activeIndex = -1;
                vm.query = function (value) {
                    value = value.toLowerCase();
                    this.filter = value == '' ? [] :
                        value.trim() === '' ?
                        datas :
                        datas.filter(function (item) {
                            return ~item.toLowerCase().indexOf(value);
                        });
                    reset();
                };
                vm.vals = function (index) {
                    $elem.val(vm.filter[index]);
                };
                vm.itemClick = function (index) {
                    vm.vals(index);
                    reset();
                };
            }
            vm.$init = function () {
                elem.msRetain = true;
                elem.parentNode.insertBefore($containerDOM[0], elem);
                $containerDOM[0].insertBefore(elem, $containerDOM[0].lastElementChild);
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
                            reset();
                        } break;
                        case 13: {//enter
                            stop(e);//防止表单提交
                            e.stopPropagation();
                            if (!~vm.activeIndex) return false;
                            vm.vals(vm.activeIndex);
                            reset();
                        } break;
                            //default:
                            //    reset();
                            //    break;
                    }
                })
                    .on('input', vm.multiple ?
                    function () {
                        vm.query(this.value);
                    } : function () {
                        vm.query(this.value);
                    })

                //.on('blur', function () {
                //    reset();
                //});

                if (vm.values && vm.values.length) {
                    $elem.on('keydown', function (e) {
                        switch (e.keyCode) {
                            case 9://tab
                                //case 188://,
                                //case 190://.
                                {
                                    e.preventDefault();
                                    if (trim.call(elem.value) === '' || !options.custom) return;
                                    vm.values.push(trim.call(elem.value));
                                    elem.value = '';
                                    //TODO 这里得通知到外面其实是有值的
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
                    if (e.target !== $containerDOM[0] && e.target.parentNode !== $containerDOM[0])
                        reset();
                });


                /*
                    不能用avalon.scan()和avalon.scan($containerDOM[0],viewModel)
                    要把过去avalon binding的model给绑定上来，否则这个widget就会覆盖掉页面上默认binding的行为
                    参见：http://www.avalon.org.cn/art/552fb77d36803503a50000a4?number=20&from=0
                */
                avalon.scan($containerDOM[0], [viewModel].concat(vms));
            };
            vm.$remove = function () {
                $elem.remove();
                $elem = null;
            };

        });
        return viewModel;
    };
    widget.defaults = {
        getTemplate: function (tmp) {
            //可有可无，用户自己配置模板
            return tmp;
        },
        classContaier: 'queryInputBar tagInputBar form-control',
        classSelected: 'tag-selected',
        classValuesItem: 'tag-selectItem',
        classQuerySelect: 'querySelect',
        classSelectItem: 'select-item',
        multiple: false,
        custom: false,
        values: [],
        datas: [],
        zIndex: -1
    };
    return widget;
});


