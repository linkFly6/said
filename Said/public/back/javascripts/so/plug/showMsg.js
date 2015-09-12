(function (window) {
    // Client-side export
    if (typeof window === 'undefined' || !window.so) return;
    var so = window.so,
        templentContainer = '<div class="showmsg-container">${0}</div>',
        templent = '${0}<div class="showmsg-content ${1}">${2}<div class="showmsg-context">${3}</div></div>',
        globalConfig = {
            cache: true,//是否缓存这次结果
            title: null,
            context: null,
            //width: 320,
            height: 'auto',
            placement: 'auto',//top | bottom | left | right | auto
            close: 'auto'
        },
        timeout = function (callback, time, data) {
            var id = setTimeout(function () {
                callback(data);
                clearTimeout(id);
            }, time);
            return id;
        },
        body = window.document.body,
        append = function (elem) {
            body.appendChild(elem);
            return elem;
        },
        remove = function (elem) {
            return body.removeChild(elem);
        },
        parseHTML = function (html) {
            var doc = document.createElement('div');
            doc.innerHTML = html;
            return doc.firstElementChild;
        },
        getScrollTop = function () {
            return window.pageYOffset;
            //|| window.scrollY ||//ff&chrome
            //document.documentElement.scrollTop;//ie
        },
        setPos = function (elem) {
            //位置获取还是有问题啊...
            var width = elem.clientWidth + 6,//border=>3px
                height = elem.clientHeight + 6 + 200,//+200是为了美观，偏上一丢丢...
                innerHeight = window.innerHeight,//视口高度
                innerWidth = window.innerWidth,//视口宽度
                scrollTop = getScrollTop();//滚动条滚动高度，如果考虑横向滚动条的话则需要再计算横向滚动条卷去的宽度
            //955
            elem.style.top = (innerHeight - height) / 2 + scrollTop + 'px';
            elem.style.left = (innerWidth - width) / 2 + 'px';
        },
        stateFlags = 'OK ERROR WARNING',
        stateNames = [],
        State = {},
        setGlobalShowMsg = function () {
            var currentShowMsg;
            return function (showMsgObject) {
                if (currentShowMsg)
                    currentShowMsg.clear();
                currentShowMsg = showMsgObject;
            };
        }();
    var ShowMsg = function (text, state, time) {
        if (!(this instanceof ShowMsg))
            return new ShowMsg(text, state, time);
        if (!text) return;
        if (state === true) {
            time = true;
            state = null;
        }
        var isLockModel = time === true,
            formatStrs = [isLockModel ? '<div class="showmsg-mask"></div>' : ''],
            stateName = state != null && stateNames[state] || '',
            elem, html;
        stateName ?
            formatStrs.push('showmsg-state-' + stateName, '<img class="showmsg-state" src="/Content/Back/Images/showMsg/' + stateName + '.png" />') :
            formatStrs.push('', '');
        formatStrs.push(text);
        html = so.format(templent, formatStrs[0], formatStrs[1], formatStrs[2], formatStrs[3]);
        elem = this.elem = parseHTML(isLockModel ? so.format(templentContainer, html) : html);
        if (isLockModel) {
            elem.firstElementChild.addEventListener('click', function () {
                setGlobalShowMsg(null);
            });
            //还要给window绑定回车和空格，按这俩也都隐藏..
        }
        append(elem);
        setPos(time == true ? elem.lastElementChild : elem);
        setGlobalShowMsg(this);
        if (time === true) return;
        this.timeoutId = timeout(function () {
            setGlobalShowMsg(null);
        }, typeof time === 'number' && time > 0 ? time : ShowMsg.time);
    };
    ShowMsg.prototype.clear = function () {
        clearTimeout(this.timeoutId);
        remove(this.elem);
    };
    //状态标识
    stateFlags.split(' ').forEach(function (str, i) {
        var state = str.split(' ');
        State[state[0]] = i;
        ShowMsg[state[0]] = i;
        stateNames[i] = state[0].toLowerCase();
    });
    ShowMsg.time = 3000;
    window.showMsg = ShowMsg;
    //兼容amd
    if (typeof define === "function" && define.amd) {
        define("showMsg", ['so'], function () {
            return ShowMsg;
        });
    }
})(window);