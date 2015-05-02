define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div class="queryInputBar">\
        <div class="querySelect" ms-css-display="display">\
            <a class="select-item" href="javascript:;" ms-repeat-item="filter" ms-class="active:$index==activeIndex"  ms-attr-data-index="{{$index}}">{{item}}</a>\
        </div></div>',
        defaults = {};
    var widget = avalon.ui.autoComplete = function (elem, data, vms) {
        var datas = data.autoCompleteOptions.datas,
            options = data.autoCompleteOptions,
            $containerDOM = $(template),
            viewModel, $elem = $(elem),
            stop = function (e) {
                e.preventDefault();
            },
            len;
        viewModel = avalon.define(data.autoCompleteId, function (vm) {
            var display = function (isDisplay) {
                //isDisplay=true：显示、isDisplay=false：不显示、isDisplay==null：根据长度显示
                vm.display = isDisplay == true || (isDisplay == null && (len = vm.filter.length)) ? 'block' : 'none';
                vm.activeIndex = -1;
            };
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
                display();
            };
            vm.vals = function (index) {
                var argType = typeof index;
                if (argType === 'string')
                    $elem.val(index);
                else if (argType === 'number')
                    $elem.val(vm.filter[index]);
            };
            vm.$init = function () {
                elem.msRetain = elem.parentNode.msRetain = true;
                elem.parentNode.insertBefore($containerDOM[0], elem);
                $containerDOM[0].insertBefore(elem, $containerDOM[0].firstElementChild)
                //avalon.scan($containerDOM[0], viewModel);
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
                            display(false);
                        } break;
                        case 13: {//enter
                            stop(e);//防止表单提交
                            e.stopPropagation();
                            if (!~vm.activeIndex) return false;
                            vm.vals(vm.activeIndex);
                            display(false);
                        } break;
                        default:
                            display(false);
                            break;
                    }
                })
                    .on('input', function () {
                        vm.query(this.value);
                    })
                elem.msRetain = elem.parentNode.msRetain = false;
                //.on('blur', function () {
                //    display(false);
                //});

                //这里好纠结啊，为elem注册blur，firefox下blur触发在content.click之前，所以要给document下注册事件，法克...
                window.document.addEventListener('click', function (e) {
                    if (e.target !== $containerDOM[0] && e.target.parentNode !== $containerDOM[0])
                        display(false);
                });
                $containerDOM.on('click', 'a', function () {
                    vm.vals(this.innerHTML);
                    display(false);
                });
                /*
                特么这一句，不能用avalon.scan()和avalon.scan($containerDOM[0],viewModel)
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
    return widget;
});


