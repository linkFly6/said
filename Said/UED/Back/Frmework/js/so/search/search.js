'use strict';
define(['so'], function (so) {
    //自己的这些插件一定要依赖so插件，定义模板引擎等
    var globalOption = {
        className: 'querySelect',
        itemClass: 'select-item',
        tmpContent: '<div class="${className}" ${id}></div>',
        tmpItem: '<a data-index="${0}" href="javascript:;" class="${1}">${2}</a>',
        active: 'active'
        //id: null
        //, def: '没有检索到相关信息'
    },
    query = function (data, value, def) {
        /*
        根据定义的数据查找
        支持['javascript','linkFly']和[{javascript:'jsjavascript','lf':'lflinkFly'}]
        */
        var res = [];
        so.each(data, so.isObject(data) ?
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
        html.push('</div>');
        return html.join('');
        return so.format(option.tmpContent, {
            className: option.itemClass || '',
            id: option.id == null ? '' : 'id="' + option.id + '"',
            content: html.join('')
        });
    },
    register = function (elem, content, data, option) {
        //注册事件
        var list, i = -1, active = [], len = 0, className = option.className;
        elem.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 40: {//down
                    list = res.children;
                    len = list.length;
                    active.length && (active.className = '');
                    if (i === len) i = -1;
                    if (i + 1 >= len) return i = -1;
                    active = list[++i];
                    active.className = className;//'active'
                }
                    break;
                case 38: {//up
                    list = res.children;
                    len = list.length;
                    active.length && (active.className = '');
                    if (i === -1) i = len;
                    if (i - 1 < 0) return i = len;
                    active = list[--i];
                    active.className = className;
                }
                    break;
                    ////case 13: {
                    ////    alert('回车');
                    ////}
                    //break;
                default: {
                    i = -1;
                }
                    break;
            }
        });
        //搜索事件注册在哪儿呢？keydown会少一位、keyup丢失精度，使用发生在keydown之后，keyup之前的onkeypress/keypress,注意keypress不能使用组合键？？
        elem.addEventListener('keypress', function (e) {
            switch (e.keyCode) {
                case 13://enter
                    break;
                case 40 || 38:
                    break;
                default:
                    //keypress也不能准确的捕获到this.value的值
                    content.innerHTML = get(query(data, e.key));
                    break
            }
        });
    },
    search = function (elem, data, option) {
        if (!elem || elem.nodeType !== 1 || !so.isArrayLike(data)) return elem;
        var option = so.extend({}, globalOption, option), content;
        elem.insertAdjacentHTML('afterEnd', so.format(option.tmpContent, {
            className: option.itemClass || '',
            id: option.id == null ? '' : 'id="' + option.id + '"'
        }));
        register(elem, elem.nextElementSibling/*找到刚才生成的节点*/, data, option);
        return elem;
    };
    return function (data) {

    };
});