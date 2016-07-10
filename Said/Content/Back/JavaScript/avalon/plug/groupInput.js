define(['so', 'jquery', 'avalon'], function (so, $, avalon) {
    'use strict';
    var globalTemplate = '<div class="OPTION_CONTAINER_CLASS" style="position:relative;ZINDEX"><div class="OPTION_BODY" >\
                        <div class="OPTION_SELECTED" ms-visible="isMultiple&&values.length">\
                            <label ms-repeat-item="values"><span>{{item.name}}</span><a class="OPTION_VALUESITEM" href="javascript:;" ms-click="removeClick($index)">×</a></label>\
                        </div></div>\
                        <div style="position:relative;"><div class="OPTION_QUERYSELECT" style="position:absolute;top:1px;" ms-visible="filters.length">\
                            <a class="OPTION_ITEM" href="javascript:;" ms-repeat-item="filters" ms-class="active:$index==activeIndex"  ms-click="itemClick($index)">{{item.name}}</a>\
                        </div></div></div>';

    //参数datas的格式
    //var demo = [
    //    {
    //        name: '显示的名称',
    //        query: '查询词',
    //        data: '传递的数据'
    //    }
    //];

    var widget = avalon.ui.groupInput = function (elem, data, vms) {
        var options = data.groupInputOptions,
            datas = data.groupInputOptions.datas,
            callback = options.callback,
            trim = String.prototype.trim,
            max = options.max,
            $containerDOM,
            vm, $elem = $(elem),
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

        var isMultiple = options.multiple, acceptCustom = options.custom, filters,
            //默认值
            defaultsValues;
        if (options.values) {
            defaultsValues = options.values.map(function (item) {
                return typeof (item) == 'object' ? item : {
                    query: item,
                    name: item,
                    data: item
                };
            });
        } else
            defaultsValues = [];

        vm = avalon.define({
            $id: data.groupInputId,
            activeIndex: -1,
            isMultiple: isMultiple,
            values: defaultsValues,
            filters: [{ name: '', query: '', data: {} }],
            removeClick: function (index) {
                vm.values.splice(index, 1);
            },
            reset: function (isClear) {
                if (isClear === true) {
                    vm.filters.splice(0, vm.filters.length);
                    len = 0;
                }
                vm.activeIndex = -1;
            },
            query: options.query ? function (value) {
                if (!isMultiple)
                    vm.values.clear();
                this.filters = options.query(datas);
                if (!so.isArrayLike(this.filters))
                    this.filters = [];
                this.filters.splice(0, 10);
                len = this.filters.length;
                reset();
            } : function (value) {
                value = value.trim().toLowerCase();
                if (!isMultiple)
                    vm.values.clear();
                this.filters.clear();
                so.each(datas, function (item, i) {
                    //支持二维数组
                    if (typeof item === 'object') {
                        //使用some尝试终止循环
                        if (vm.values.length) {
                            //如果已经有了值
                            if (vm.values.some(function (obj) {
                            return !~obj.query.toLowerCase().indexOf(item.query.toLowerCase()) && ~item.query.toLowerCase().indexOf(value);
                            })) {
                                vm.filters.push(item);
                            }
                        } else if (~item.query.toLowerCase().indexOf(value))
                            vm.filters.push(item);
                    } else {
                        if ((vm.values.length == 0 || vm.values.every(function (obj) {
                             return !~obj.query.indexOf(item) && ~item.toLowerCase().indexOf(value);
                        }))) {
                            vm.filters.push({
                                name: item,
                                query: item,
                                data: item
                            })
                        }
                    };

                    if (vm.filters.length >= max) return false;
                });
                len = vm.filters.length;
                vm.reset();
            },
            itemClick: function (index) {
                vm.vals(index);
                vm.reset(true);
                elem.focus();
            },
            //把vm.values(viewmodel对象)转换为真正的js对象
            value2Data: function () {
                return vm.values.map(function (item) {
                    return {
                        name: item.name,
                        query: item.query,
                        data: item.data
                    }
                });
            },
            vals: function (index) {
                var value = typeof index === 'number' ?
                    vm.filters[index] :
                    acceptCustom ?
                    index ? {
                        name: index,
                        query: index,
                        data: index
                    } : '' : '';
                //TODO 去重处理？
                if (value) {
                    vm.values.push(value)
                }
                elem.value = isMultiple || !value ? '' : value.name;
            },
            /*下拉框逻辑*/
            checkCustomInput: function () {
                if (!acceptCustom && elem.value.trim().length) {
                    var value = elem.value.trim();
                    if (!datas.some(function (item) {
                        if (typeof item == 'object') {
                        return item.name === value;
                    } else {
                        return item === value;
                    }
                    })) {
                        elem.value = '';
                        //if (!isMultiple) vm.values.clear();
                    }
                }
            },
            $init: function () {
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
                            vm.reset(true);
                            vm.checkCustomInput();
                        } break;
                        case 13: {//enter
                            stop(e);//防止表单提交
                            e.stopPropagation();
                            if (!~vm.activeIndex) return false;
                            vm.vals(vm.activeIndex);
                            vm.reset(true);
                        } break;
                        default:
                            vm.reset();
                            break;
                    }
                });
                if (datas && datas.length)
                    $elem.on('input', function () {
                        vm.query(this.value);
                    })
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
                        vm.reset(true);
                        vm.checkCustomInput();
                    }
                });


                /*
                    不能用avalon.scan()和avalon.scan($containerDOM[0],viewModel)
                    要把过去avalon binding的model给绑定上来，否则这个widget就会覆盖掉页面上默认binding的行为
                    参见：http://www.avalon.org.cn/art/552fb77d36803503a50000a4?number=20&from=0
                */
                avalon.scan($containerDOM[0], [vm].concat(vms));
            },
            $remove: function () {
                $containerDOM.remove();
                $containerDOM = null;
            }
        });

        vm.values.$watch('length', function (newLength, oldLength) {
            callback.call(elem, newLength === 0 ?
                isMultiple ? [] : ''
                : isMultiple ? vm.value2Data() : vm.value2Data()[0]);
        });

        vm.filters.clear();
        return vm;
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
        zIndex: -1,
        max: 10
    };
    return widget;
});


