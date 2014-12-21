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
        //,callback:function(){} - 参数[文本框的值，选中项的值，选中项的索引，选中项DOM]，this指向文本框，返回值将作为选中项的值
        //,listener:function(){} - 参数[输入的值，event事件]，this指向文本框
    },
    query = function (data, value) {
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
        //if (!res.length && def != null) res.push(def);
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
            def = option.def == null ? false : get([option.def], option),
            reset = function (isHide) {
                active = null;
                i = -1;
                isHide === isHide && (content.style.display = 'none');
            }, stop = function (e) {
                e.preventDefault();
            }
        elem.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 40: {//down
                    stop(e);//在输入框文本极端（左右）的时候，会移动焦点，阻止这一浏览器行为
                    if (!len) return;
                    active && (active.className = itemClass);
                    if (i === len) i = -1;
                    if (i + 1 >= len) return i = -1;
                    active = content.children[++i];
                    active.className = activeClass;//'active'
                } break;
                case 38: {//up
                    stop(e);
                    if (!len) return;
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
                    e.stopPropagation();
                    if (!active || !len) return false;
                    elem.value = callback ? String(callback.call(active, elem.value, active.innerHTML, active.dataset.index)) : list[i];
                    reset(true);
                } break;
                default:
                    reset();
                    break;
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
            list = query(data, this.value);
            if (len = list.length) {
                content.innerHTML = get(list, option);
                content.style.display = '';
            } else if (def) {
                content.innerHTML = def;
                content.style.display = '';
            } else
                content.style.display = 'none';
            listener && listener.call(elem, elem.value, e);
        });
        //注册监听（如果注重移动端效果，则需要为每个元素注册）
        content.addEventListener('click', function (e) {
            if (e.target.nodeName === 'A' && len != 0) { //侦听到下面的a，如果指定有默认值则检测是否是默认值，如果是默认值则取消侦听
                elem.value = callback ? String(callback.call(elem, elem.value, e.target.innerHTML, e.target.index, e.target)) : e.target.innerHTML;
                reset(true);
            }
        });
        //这里好纠结啊，为elem注册blur，firefox下blur触发在content.click之前，所以要给document下注册事件，法克...
        window.document.addEventListener('click', function (e) {
            if (e.target !== content && e.target.parentNode !== content)
                reset(true);
        });
        elem.addEventListener('blur', function () {
            if (len === 0 && def)//指定有默认值，则清空value
                elem.value = '';
        });
        return content;
    };
    return function (elem, data, option) {
        /// <summary>
        /// 1: 构建一个Search对象
        /// &#10; 1.1 - Search(elem, content, data) - 根据默认配置构建Search，不指定callback、listener、模板等
        /// &#10; 1.2 - Search(elem, content, option) - 根据option的配置（参阅globalOption）构建
        /// &#10; 1.3 - Search(elem, content, data, callback,listener) - 构建Search，同时指定option.callback（每次从预定数据中获取数据的时候调用）和option.listener（每次值改变都会调用，可略）
        /// </summary>
        /// <param name="elem" type="Element">
        /// 要监听的input元素
        /// </param>
        /// <param name="data" type="Object">
        /// 允许为数组/对象，当为一维数组的时候检索和获取的值都是数组项，为对象的时候将检索对象的每个属性的value，得到该属性的name
        /// </param>
        /// <param name="option" type="Object">
        /// 配置Search对象，有如下配置项
        /// &#10;  className - 指定生成的下俩框模块的className，默认为querySelect
        /// &#10;  itemClass - 指定每个下拉项的className,默认为select-item
        /// &#10;  tmpContent - 指定生成的下拉框的模板，默认值：<div class="${className}" ${id}>${content}</div>
        /// &#10;  tmpItem - 指定生成的下拉项的模板，默认值：<a data-index="${0}" href="javascript:;" class="${1}">${2}</a> 
        /// &#10;  active - 当前激活/选中的下拉项的className：active
        /// &#10;  id - 生成的下拉框的id
        /// &#10;  def - 当没有检索的数据的时候，显示的默认文字，当配置该项的时候，下拉框的数据源只能从预定数据中选取，而不能自行输入
        /// &#10;  callback - 回调函数，当选中下拉框数据源的时候会触发该函数：参数[文本框的值，选中项的值，选中项的索引，选中项DOM]，this指向文本框，返回值将作为选中项的值
        /// &#10;  listener - 监听函数，每次输入值改变的时候都会触发该函数：参数[输入的值，event事件]，this指向文本框
        /// </param>
        /// <returns type="Element" />

        elem = document.getElementById(elem + '') || elem;
        if (!elem || elem.nodeType !== 1 || !(so.isArrayLike(data) || so.isObject(data))) return elem;
        var currOption = so.extend({}, globalOption, option), content;
        if (so.isFunction(option)) {
            currOption.callback = option;
            if (arguments.length > 3 && so.isFunction(arguments[3]))
                currOption.listener = arguments[3];
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