(function (window, $, undefined) {
    var templent = {
        td: '<td>${0}</td>',
        tr: '<tr class="${1}">${0}</tr>',
        table: '<table class="grid-table"><thead>${0}</thead><tbody>${1}</tbody></table>'
    },
        push = Array.prototype.push,
        Bootgrid = function (elem) {
            if (!(elem instanceof Bootgrid)) return;
            if (elem && elem.nodeType === 1 && (elem = $(elem)).hasClass('bootgrid')) {
                this.element = elem;
                this.rows = elem.children('tbody').find('tr');
                this.length = this.rows.length;
                this.ths = elem.children('thead').find('th');
            }
        },
        toggleSort = [
            ['bt-up', function (seed, elems) {
                $.each(seed, function (i, index) {
                    elemes[0].parentNode.insertBefore(elems[index], elemes[0]);
                });
            }],
            ['bt-down', function (seed, elems) {

            }],
            ['deault', function (seed, elems) {

            }]
        ],
        getSeed = function (elems, num) {
            var seed = [], colums = [], j = 0, aTxt, bTxt;
            $.each(elems, function (i, elem) {
                seed.push(i);
                colums.push(elem[num]);
            });
            seed.sort(function (a, b) {
                aTxt = $.text(elems[j]);
                bTxt = $.text(elems[j++]);
                return aTxt > bTxt;
            });
        };

    Bootgrid.prototype = {
        constructor: Bootgrid,
        add: function (elem) {
            this.element.append(elem);
            return this;
        },
        remove: function (num) {
            return this.element.rows.remove(num);
        },
        sort: function (num) {
            var headColumn;
            if (!(headColumn = this.ths.eq(num = +num)))
                return this;
            var data = $.data('bootgrid') || $.data('bootgrid', {}), result;
            $.each(toggleSort, function (i, item) {
                if (headColumn.hasClass(item[0]))//这个num如果是负数怎么办？
                    return result = item[1](data[item[0]] || (data[item[0]] = getSeed(this.rows, num))), false;
            });
        },
        on: function () {

        }
    };
    Bootgrid.load = function () {

    };
    $.extend({
        bootgrid: function (elem) {

        }
    });
})(window, jQuery);