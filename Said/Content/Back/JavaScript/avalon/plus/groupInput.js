define(['jquery', 'avalon'], function ($, avalon) {
    var globalTemplate = '<div class="OPTION_CONTAINER_CLASS" style="position:relative;ZINDEX" ><div class="OPTION_BODY">\
                        <div class="OPTION_SELECTED" ms-visible="values.length">\
                            <label ms-repeat-item="values"><span>{{item}}</span><a class="OPTION_VALUESITEM" href="javascript:;" ms-click="removeClick($index)">×</a></label>\
                        </div></div>\
                        <div class="OPTION_QUERYSELECT" style="position:absolute;" ms-visible="filters.length">\
                            <a class="OPTION_ITEM" href="javascript:;" ms-repeat-item="filters" ms-class="active:$index==activeIndex"  ms-click="itemClick($index)">{{item}}</a>\
                        </div></div>';
    //TODO 把最后一个div[OPTION_QUERYSELECT]给移到大div外面，然后加一个隔板就可以了
    var widget = avalon.ui.groupInput = function (elem, data, vms) {
        var options = data.groupInputOptions,
            datas = data.groupInputOptions.datas,
            trim = String.prototype.trim,
            $containerDOM,
            viewModel, $elem = $(elem),
            stop = function (e) {
                e.preventDefault();
            },
            len;
        //TODO 注意修正样式的正确性
        $containerDOM = $(globalTemplate.replace('OPTION_CONTAINER_CLASS', options.classContaier || '')
                                    .replace('ZINDEX', options.zIndex > 0 ? 'z-index:' + options.zIndex + '' : '')
                                    .replace('OPTION_SELECTED', options.classSelected || '')
                                    .replace('OPTION_VALUESITEM', options.classValuesItem || '')
                                    .replace('OPTION_BODY', options.classbody || '')
                                    .replace('OPTION_QUERYSELECT', options.classQuerySelect || '')
                                    .replace('OPTION_ITEM', options.classSelectItem || ''));
        viewModel = avalon.define(data.groupInputId, function (vm) {
            var isMultiple = options.multiple,
                domQueryBody = $containerDOM[0].lastElementChild,//如果是多选模式，则可能需要计算位置信息
                positionTop;
            /*tag逻辑*/
            vm.values = [];
            if (isMultiple) {
                if (Array.isArray(options.values))
                    vm.values = options.values.filter(function (item) {
                        return String(item).length > 0;
                    });
                vm.removeClick = function (index) {
                    vm.values.splice(index, 1);
                };
                positionTop = $elem.offset().top;
            }
            /*下拉框逻辑*/
            var reset = function (isClear) {
                if (isClear === true) {
                    vm.filters.splice(0, vm.filters.length);
                    elem.focus();
                    len = 0;
                }
                vm.activeIndex = -1;
            };
            if (datas && datas.length) {
                vm.filters = [];
                vm.display = 'none';
                vm.activeIndex = -1;
                vm.query = function (value) {
                    value = value.toLowerCase();
                    this.filters = value == '' ? [] :
                        value.trim() === '' ?
                        datas :
                        datas.filter(function (item) {
                            return ~item.toLowerCase().indexOf(value);
                        }).splice(0, 10);
                    if (len = this.filters.length) {
                        if (isMultiple)
                            domQueryBody.style.top = $containerDOM.height() + 1 + 'px';
                    }
                    reset();
                };
                vm.vals = function (index) {
                    if (isMultiple) {
                        vm.values.push(vm.filters[index]);
                        $elem.val('');
                    } else
                        $elem.val(vm.filters[index]);
                };
                vm.itemClick = function (index) {
                    vm.vals(index);
                    reset(true);
                };
            }
            vm.$init = function () {
                elem.msRetain = true;
                elem.parentNode.insertBefore($containerDOM[0], elem);
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
                })
                    .on('input', isMultiple ?
                    function () {
                        vm.query(this.value);
                    } : function () {
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
        classbody: 'tag-body',
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


