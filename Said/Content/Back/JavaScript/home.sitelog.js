define('home.sitelog', ['jquery', 'so', 'avalon', 'sweetalert', 'dialog', 'bsTable', 'source', 'bs-date'], function ($, so, avalon, sweetalert, dialog) {

    var database = so.Database('back.sitelog');

    return function (ErrorLogDatas, InfoLogDatas, Action) {

        //var dataList = [];
        // 主要数组
        //var mainList = ErrorLogDatas.length > InfoLogDatas.length ? ErrorLogDatas : InfoLogDatas;
        //// 次要数组
        //var minorList = ErrorLogDatas.length >= InfoLogDatas.length ? InfoLogDatas : ErrorLogDatas;

        //var dataRowTemplate = {
        //    error: {
        //        name: '',
        //        lastWriteTime: '',
        //        size: ''
        //    },
        //    info: {
        //        name: '',
        //        lastWriteTime: '',
        //        size: ''
        //    }
        //};

        //var fileKeys = {};

        //ErrorLogDatas.forEach(function (item) {
        //    fileKeys[item.Name] = true;
        //});

        //InfoLogDatas.forEach(function (item) {
        //    fileKeys[item.Name] = true;
        //});

        //Object.keys(fileKeys).sort(function (a, b) {
        //    var aName = a.split('.')[0];
        //    var bname = b.split('.')[1];
        //    return b - a;
        //}).forEach(function (key) {
        //    var row = {
        //        error: {
        //            name: '',
        //            lastWriteTime: '',
        //            size: ''
        //        },
        //        info: {
        //            name: '',
        //            lastWriteTime: '',
        //            size: ''
        //        }
        //    };
        //    ErrorLogDatas.forEach(function (item) {
        //        if (key === item.Name) {

        //        }
        //    })
        //});

        // 数组合并
        //mainList.forEach(function (mainItem) {
        //    var row = so.extend({}, dataRowTemplate);
        //    row[mainItem.type] = {
        //        name: mainItem.Name,
        //        lastWriteTime: mainItem.LastWriteTime,
        //        size: mainItem.Length
        //    };
        //    while (minorList.length) {
        //        var minorItem = minorList.shift();
        //        if (minorItem.Name === mainItem.Name) {
        //            row[minorItem.type] = {
        //                name: minorItem.Name,
        //                lastWriteTime: minorItem.LastWriteTime,
        //                size: minorItem.Length
        //            };
        //            dataList.push(row);
        //        } else {
        //            var childRow = so.extend({}, dataRowTemplate);
        //            childRow[minorItem.type] = {
        //                name: minorItem.Name,
        //                lastWriteTime: minorItem.LastWriteTime,
        //                size: minorItem.Length
        //            };
        //            dataList.push(childRow);
        //            return true;
        //        }
        //    }
        //    return true;
        //});

        $(function () {
            var vmPage = avalon.define({
                $id: 'vmPage'
            });

            avalon.scan();
            //获取与国际通用UTC时间的分钟差（北京 = -480m = 8h）
            var timezoneOffset = new Date().getTimezoneOffset();//datatimepicker组件使用的国际通用UTC时间，和北京时间相差8个小时，所以要修正时间差，获取
            var dateInput = $(vmPage.elem.queryDate).datetimepicker({
                minView: 'month',//bootstrap-datetimepicker:#1677
                endDate: new Date
            }).on('changeDate', function (e) {
                var selectDate = so.parseDate(e.date.getTime());//因为要修正时间，但是不能直接修改组件内置对象的时间，所以copy一个副本
                //修正UTC时间（分钟）差
                selectDate.setMinutes(timezoneOffset);
                //重置时间到23:59:59
                selectDate.setHours(23, 59, 59, 0);
                var data = PageDatas.filter(function (data) {
                    return so.parseDate(data.Date).getTime() <= selectDate.getTime();
                });
                $btTable.bootstrapTable('load', data);
            });
            var $btTable = $('#btTable').bootstrapTable({
                columns: [
                 { field: 'Name', title: '文件名', visible: true, },
                 {
                     field: 'LastWriteTime',
                     title: '最后修改日期',
                     valign: 'middle',
                     sortable: true,
                     formatter: function (value, row, index) {
                         //console.log(row); //row可以访问到数据
                         //return ['<a target="_black" href="', Action.article, '">', value, '</a>'].join('');
                         console.log(value);
                         return [so.dateFormat(new Date(value), 'yyyy-MM-dd HH:mm')].join('');
                     }
                 },
                 {
                     field: 'Length',
                     title: '文件大小 (kb)',
                     valign: 'middle',
                     sortable: true,
                     formatter: function (value, row, index) {
                         return (value / 1024).toFixed(2) + ' kb';
                     }
                 }],
                data: ErrorLogDatas
            }).on('click', '.data-delete', function (e) {
                var data = this.dataset, $this = $(this);
                dialog('您确定要删除该Bannner么？').on(function () {
                    $this.attr('disabled', 'disabled').html('删除中');
                    vmPage.remove(data.id, function () {
                        $this.length && $this.removeAttr('disabled');
                    });
                }).show();
            });
        })
    }

});