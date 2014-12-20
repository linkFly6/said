'use strict';
define(['../so'], function (so) {
    //自己的这些插件一定要依赖so插件，定义模板引擎等
    var globalOption = {
        className: 'querySelect',
        itemClass: 'select-item',
        tmpContent: '<div class="${className}" ${id}>${content}</div>',
        tmpItem: '<a data-index="${0}" href="javascript:;" class="${1}">${2}</a>',
        active: 'active'
        //id: null
        //, def: '没有检索到相关信息'
        //,callback:function(){} - 参数[文本框的值，选中项的值，选中项的索引]，this指向选中项，返回值将作为选中项的值
        //,listener:function(){} - 参数[event事件]，this指向文本框
    },
    query = function (data, value, def) {
        /*
        根据定义的数据查找
        支持['javascript','linkFly']和[{javascript:'jsjavascript','lf':'lflinkFly'}]
        优化，预先把数据调整好，后面就不用再检测数据合法了
        以后要搞个能挂数据的格式...
        */
        value = String(value).toLowerCase();
        var res = [];
        value !== '' && so.each(data, so.isObject(data) ?
                function (key, str) {
                    str.toLowerCase().indexOf(value) !== -1 && res.push(key);
                } : function (str) {
                    str.toLowerCase().indexOf(value) !== -1 && res.push(str);
                });
        if (!res.length && def != null) res.push(def);
        return res;
    },
    get = function (data, option) {
        //将查找的结果生成HTML
        var html = [];
        data.forEach(function (value, i) {
            html.push(so.format(option.tmpItem, i, option.itemClass || '', value));
        });
        return html.join('');
    },
    stop = function (e) {
        e.preventDefault();
        e.stopPropagation();
    },
    register = function (elem, content, data, option) {
        /// <summary>
        /// 1: 注册事件，返回content - linkFly
        /// &#10;     - 根据option的配置，需要支持多重选择（例如标签的多重选择）
        /// &#10; 1.1 - register(elem, content, data, option)
        /// </summary>
        /// <param name="elem" type="Element">
        /// 要监听的input元素
        /// </param>
        /// <param name="content" type="Element">
        /// 生成的上下文对象
        /// </param>
        /// <param name="data" type="Array">
        /// 数据源，支持对象和数组，请参阅query()
        /// </param>
        /// <param name="option" type="Object">
        /// 配置，请参阅globalOption
        /// </param>
        /// <returns type="Element" />

        /*
            【【【【【【【【TODO】】】】】】】】
            1、需要测试有默认值的情况：没有查找到默认值则显示没有找到输入
            2、可配置上下选择项的时候，输入框的值是否改变
            3、多值选择，能够在输入框选择多个值
            4、未来考虑：如果多值选择的话，delete则应该会整块值的删除
            5、多值选择引入dataset
            6、让search成为一个对象，引入callback、val()等事件注入
            7、【第一次获取焦点并且输入框没有内容的时候，显示数据项】
            8、【是否脱离so.js】
            9、提升容错性
            10、【可配置数据显示项个数】
        */
        content.style.display = 'none';
        var list, i = -1,
            active,
            len = 0,
            itemClass,
            activeClass = [itemClass = option.itemClass, option.active].join(' '),
            callback = so.isFunction(option.callback) ? option.callback : false,//指定回调函数
            listener = so.isFunction(option.listener) ? option.listener : false,
            reset = function (isHide) {
                active = null;
                i = -1;
                isHide === isHide && (content.style.display = 'none');
            }, stop = function (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        elem.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 40: {//down
                    stop(e);//在输入框文本极端（左右）的时候，会移动焦点，阻止这一浏览器行为
                    active && (active.className = itemClass);
                    if (i === len) i = -1;
                    if (i + 1 >= len) return i = -1;
                    active = content.children[++i];
                    active.className = activeClass;//'active'
                } break;
                case 38: {//up
                    stop(e);
                    active && (active.className = itemClass);
                    if (i === -1) i = len;
                    if (i - 1 < 0) return i = len;
                    active = content.children[--i];
                    active.className = activeClass;
                } break;
                case 27: {//esc
                    reset(true);
                } break;
                case 13: {//enter
                    stop(e);//防止表单提交
                    if (!active) return false;
                    elem.value = callback ? String(callback.call(active, elem.value, active.innerHTML, active.dataset.index)) : list[i];
                    reset(true);
                } break;
                default: {
                    reset();
                } break;
            }
        });
        /*
            搜索事件注册在哪儿呢？
                1、keydown会少获取一位输入框的值（键盘按下就已经获取）
                2、keyup会丢失操作性（键盘弹起才能操作）
                3、使用发生在keydown之后，keyup之前的onkeypress/keypress,注意keypress不能使用组合键
                4、oninput是HTML5事件,ie9+支持
                5、低于ie9浏览器可以使用onpropertychange
        */
        //w3c:oninput ie:onpropertychange
        elem.addEventListener('input', function (e) {
            list = query(data, this.value, option.def);
            (len = list.length) ?
                (content.innerHTML = get(list, option), content.style.display = '') :
                    (content.style.display = option.def == null ? 'none' : '');
            listener && listener.call(elem, e);
        });
        //注册监听（如果注重移动端效果，则需要为每个元素注册）
        content.addEventListener('click', function (e) {
            if (e.target.nodeName === 'A') { //侦听到下面的a
                elem.value = callback ? String(callback.call(e.target, elem.value, e.target.innerHTML, e.target.index)) : e.target.innerHTML;
                reset(true);
            }
        });
        return content;
    };
    return function (elem, data, option) {
        //data支持对象和数组，option支持Function
        elem = document.getElementById(elem + '') || elem;
        if (!elem || elem.nodeType !== 1 || !(so.isArrayLike(data) || so.isObject(data))) return elem;
        var currOption = so.extend({}, globalOption, option), content;
        if (so.isFunction(option)) {
            currOption.callback = option;
            if (arguments.length > 3 && so.isFunction(arguments[3]))
                currOption.listener = arguments[4];
        }
        elem.insertAdjacentHTML('afterEnd', so.format(currOption.tmpContent, {
            className: currOption.className || '',
            id: currOption.id == null ? '' : 'id="' + currOption.id + '"',
            content: ''
        }));
        register(elem, elem.nextElementSibling/*找到刚才生成的节点*/, data, currOption);
        return elem;
    }
});