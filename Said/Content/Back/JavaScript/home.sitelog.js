define('home.sitelog', ['jquery', 'so', 'avalon', 'sweetalert', 'dialog', 'bsTable', 'source', 'bs-date'], function ($, so, avalon, sweetalert) {

    var database = so.Database('back.sitelog');
    var regDateStr = /^(\d{4})(\d{2})(\d{2})$/;
    var iframeTemplate = '<iframe style="display:none;" src="${0}"></iframe>';

    var renderPage = function (viewModel, datas, downLoadUrl) {
        datas.forEach(function (item) {
            var dateStr = item.Name.split('.')[0];
            var regResult = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
            item.date = new Date(+regResult[1], regResult[2] - 1, regResult[3]);
        });

        //获取与国际通用UTC时间的分钟差（北京 = -480m = 8h）
        var timezoneOffset = new Date().getTimezoneOffset();//datatimepicker组件使用的国际通用UTC时间，和北京时间相差8个小时，所以要修正时间差，获取
        var dateInput = $(viewModel.elem.queryDate).datetimepicker({
            minView: 'month',//bootstrap-datetimepicker:#1677
            endDate: new Date
        }).on('changeDate', function (e) {
            var selectDate = so.parseDate(e.date.getTime());//因为要修正时间，但是不能直接修改组件内置对象的时间，所以copy一个副本
            //修正UTC时间（分钟）差
            selectDate.setMinutes(timezoneOffset);
            //重置时间到23:59:59
            selectDate.setHours(23, 59, 59, 0);
            var data = datas.filter(function (data) {
                var timeSpan = selectDate.getTime() - data.date.getTime();
                return timeSpan <= 864e5 && timeSpan >= 0;
            });
            $btTable.bootstrapTable('load', data);
        });
        // error 表格
        var $btTable = $(viewModel.elem.btTable).bootstrapTable({
            columns: [
             {
                 field: 'Name',
                 title: '文件名',
                 visible: true,
                 sortable: true,
                 formatter: function (value, row, index) {
                     return so.format('<a data-url="${0}&file=${1}" data-file="${1}" href="javascript:;" class="data-download" target="_blank" title="点击下载日志文件">${2}</a>', downLoadUrl, encodeURIComponent(value), value);
                 }
             },
             {
                 field: 'LastWriteTime',
                 title: '最后修改日期',
                 valign: 'middle',
                 sortable: true,
                 formatter: function (value, row, index) {
                     //console.log(row); //row可以访问到数据
                     //return ['<a target="_black" href="', Action.article, '">', value, '</a>'].join('');
                     return so.dateFormat(new Date(value), 'yyyy-MM-dd HH:mm');
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
             }
            ],
            pageSize: 100,
            pageList: [100, 300, 1000],
            data: datas
        }).on('click', '.data-download', function (e) {
            var data = this.dataset, $this = $(this);
            sweetalert({
                title: data.file,
                text: '确定下载该文件',
                type: 'info',
                showCancelButton: true,
                //confirmButtonColor: "#DD6B55",
                confirmButtonText: '确认',
                cancelButtonText: '取消',
            }, function (isConfirm) {
                if (isConfirm) {
                    $('#downLoadIframe').attr('src', data.url);
                }
            });
        });
        return $btTable;
    }

    return function (ErrorLogDatas, InfoLogDatas, Action) {
        $(function () {
            var vmError = avalon.define({
                $id: 'vmError',
                clear: function () {
                    $errorTable.bootstrapTable('load', ErrorLogDatas);
                }
            });

            var vmInfo = avalon.define({
                $id: 'vmInfo',
                clear: function () {
                    $infoTable.bootstrapTable('load', InfoLogDatas);
                }
            });

            avalon.scan();

            var $errorTable = renderPage(vmError, ErrorLogDatas, Action.downLoadUrl + '?type=1');
            var $infoTable = renderPage(vmInfo, InfoLogDatas, Action.downLoadUrl + '?type=0');
        });
    }

});