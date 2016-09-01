define('home.siterecord', ['jquery', 'so', 'avalon', 'echarts', 'bsTable', 'bs-date'], function ($, so, avalon, ec) {
	'use strict';
	var echartsOption = {
		title: {
			text: '2016-01-09',
			//subtext: '今日访问量'
		},
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: ['访问量']
		},
		toolbox: {
			show: true,
			feature: {
				mark: { show: true },
				dataView: { show: true, readOnly: false },
				magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
				restore: { show: true },
				saveAsImage: { show: true }
			}
		},
		calculable: true,
		xAxis: [
			{
				type: 'category',
				boundaryGap: false,
				data: ['0:00', '1:00', '2:00', '3:00', '4:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
			}
		],
		yAxis: [
			{
				type: 'value'
			}
		],
		series: [
			//{
			//    name: '昨日',
			//    type: 'line',
			//    smooth: true,
			//    itemStyle: { normal: { areaStyle: { type: 'default' } } },
			//    data: [1, 5, 2, 15, 5, 4, 3, 2, 4, 4, 4, 5, 12, 15, 20, 7, 6, 6, 1, 0, 2, 0, 6, 20]
			//},
			{
				name: 'PV',
				type: 'line',
				smooth: true,
				itemStyle: { normal: { areaStyle: { type: 'default' } } },
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			}
		]
	};

	return function () {
		$(function () {
			var nowDateTime = so.parseDate(window.dateNow),//全局变量，服务器当前时间
		vmModel = avalon.define({
			$id: 'model',
			selectText: '无条件',
			startDate: null,
			endDate: null,
			query: function () {
				//跳到第一页，直接重新加载数据
				$bsTable.bootstrapTable('selectPage', 1);
			},
			clearDate: function () {
				vmModel.startDate = vmModel.endDate = null;
				$startDateInput.val('');
				$endDateInput.val('');
				$startDateInput.datetimepicker('setEndDate', nowDateTime);
				$endDateInput.datetimepicker('setStartDate', null);
			},
			selected: function (selectType, selectText) {
				vmModel.selectText = selectText;
				switch (selectType) {
					case 0://今天
						vmModel.startDate = vmModel.endDate = nowDateTime;
						$startDateInput.datetimepicker('setDate', nowDateTime);
						$endDateInput.datetimepicker('setDate', nowDateTime);
						break;
					case 1://一个月内
						vmModel.startDate = so.parseDate(nowDateTime.getTime());
						vmModel.startDate.setDate(1);
						$startDateInput.datetimepicker('setDate', vmModel.startDate);
						$endDateInput.datetimepicker('setDate', vmModel.endDate = nowDateTime);
						break;
					case 2://全部
						vmModel.startDate = vmModel.endDate = null;
						break;
					case 3://按时间条件查询
						break;
				}
				vmModel.query();
			}
		});
			var $bsTable = $('#btTable').bootstrapTable({
				queryParams: function (params) {
					//自定义参数
					if (vmModel.startDate != null) {
						//因为和server的时间戳计算方式不同，所以直接打字符串到server，让server解析
						params.startDate = so.dateFormat(vmModel.startDate, 'yyyy-MM-dd');
					}
					if (vmModel.endDate != null) {
						//设置结束时间为最大值
						params.endDate = so.dateFormat(vmModel.endDate, 'yyyy-MM-dd');
					}
					return params;
				},
				pageSize: 100,
				pageList: [20, 50, 100, 150, 200, 400, 600, 1000],
				columns: [
				 {
				 	field: 'UserRecordID',
				 	title: 'ID',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'LocalPath',
				 	title: '访问路径',
				 	valign: 'middle',
				 	//sortable: true,
				 	formatter: function (value, row, index) {
				 		//console.log(row); //row可以访问到数据
				 		//return ['<a target="_black" href="', Action.article, '">', value, '</a>'].join('');
				 		return value;
				 	}
				 },
				 {
				 	field: 'Query',
				 	title: '参&nbsp;&nbsp;&nbsp;数',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'UrlReferrer',
				 	title: '来源',
				 	valign: 'middle',
				 	//sortable: true,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'Key',
				 	title: '统计标识',
				 	valign: 'middle',
				 	//sortable: true,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'Date',
				 	title: '访问时间',
				 	valign: 'middle',
				 	formatter: function (value, row, index) {
				 		return so.dateFormat(value);
				 	}
				 },
				 {
				 	field: 'IP',
				 	title: 'IP',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'Country',
				 	title: '国家-省份-城市',
				 	valign: 'middle',
				 	//sortable: true,
				 	formatter: function (value, row, index) {
				 		return value + (row.Province ? ' - ' + row.Province : '') + (row.City ? ' - ' + row.City : '');
				 	}
				 },
				 {
				 	field: 'UserAgent',
				 	title: 'UA',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'OS',
				 	title: '操作系统',
				 	valign: 'middle',
				 	//sortable: true,
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value + ' - ' + row.Browser;
				 	}
				 },
				 {
				 	field: 'SpiderName',
				 	title: '网络爬虫',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'IsFile',
				 	title: '文件',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value == '0' ? '否' : '是';
				 	}
				 },
				 {
				 	field: 'Language',
				 	title: '语言',
				 	valign: 'middle',
				 	visible: false,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 }]

			}).on('load-success.bs.table', function (elem, datas) {
				//加载数据成功后回调
				//console.log(JSON.stringify(datas));
				if (datas.rows.length)
					renderChart(datas.rows);
			});



			avalon.scan();
			//开始时间
			var $startDateInput = $(vmModel.elem.startDate).datetimepicker({
				minView: 'month',
				initialDate: nowDateTime,
				endDate: nowDateTime

			}).on('changeDate', function (e) {
				vmModel.startDate = e.date;
				if (vmModel.startDate > vmModel.endDate || vmModel.endDate == null) {
					$endDateInput.datetimepicker('setUTCDate', vmModel.startDate);
					vmModel.endDate = vmModel.startDate;
				}
				$endDateInput.datetimepicker('setStartDate', e.date);
			});
			//结束时间
			var $endDateInput = $(vmModel.elem.endDate).datetimepicker({
				minView: 'month',
				initialDate: nowDateTime,
				endDate: nowDateTime
			}).on('changeDate', function (e) {
				vmModel.endDate = e.date;
				if (vmModel.endDate < vmModel.startDate || vmModel.startDate == null) {
					vmModel.startDate = vmModel.endDate;
					$startDateInput.datetimepicker('setUTCDate', vmModel.endDate);
				}
				$startDateInput.datetimepicker('setEndDate', e.date);

			});

			var userRecordChart = ec.init(document.getElementById('userChart'));
			//userRecordChart.setOption(echartsOption);

			//绘制
			function renderChart(datas) {
				var title = '',//图表显示的标题
					firstDate = so.parseDate(datas[0].Date),//数据第一条时间
					lastDate = so.parseDate(datas[datas.length - 1].Date),//数据最后一条时间
					timeAxis = [],//时间轴
					chartDataHash = {},//数据hash
					newDatas = Array.prototype.slice.call(datas, 0),
					sortIsDesc = false,//是否是倒序
					//加工数据
					createData = function (func) {
						var results = [];
						so.each(newDatas, function (item, i) {
							var date = so.parseDate(item.Date),
								tmp = func(date);
							//追加到hash
							if (!~timeAxis.indexOf(tmp)) {
								timeAxis.push(tmp);
							}
							//找到了图表数据
							if (chartDataHash[tmp])
								chartDataHash[tmp] = chartDataHash[tmp] + 1;
							else//没有找到图表数据，则创建
								chartDataHash[tmp] = 1;

						});
						so.each(timeAxis, function (item) {
							results.push(chartDataHash[item]);
						});
						return results;
					};//当前显示的单位
				//计算时间轴
				if (lastDate - firstDate < 0) {//如果第一条数据的时间大于最后一条的时间，证明是倒序
					sortIsDesc = lastDate;
					//反转
					lastDate = firstDate;
					firstDate = sortIsDesc;
					sortIsDesc = true;
					//翻转数组，因为reverse()方法作用于原数组，所以用新数组做翻转
					newDatas.reverse();
				}
				var timeSpan = lastDate - firstDate;
				/*
					如果时间差小于24小时，则按照24小时显示（1天）
					如果时间差小于48小时，则两个小时一次显示（2天）
					如果时间差小于72小时，则三个小时一次显示（3天）
					如果时间差小于96小时，则四个小时一次显示（4天）
					如果时间差大于96小时，则按照天数来切割
					如果时间差大于720小时（30天），则按照月份来切割
					否则按照年份来切割
				*/
				if (timeSpan < 6e5) {//1分钟内
					title = so.format('1分钟内访客（${0}时）', so.dateFormat(nowDateTime, 'HH:mm'));
					newDatas = createData(function (date) {
						return date.getSeconds() + 's';
					});
				} else if (timeSpan < 36e5) {//1个小时内
					title = so.format('1小时内访客（${0}时）', nowDateTime.getHours() + ':00');
					newDatas = createData(function (date) {
						return so.padNumber(date.getMinutes()) + ':' + so.padNumber(date.getSeconds());
					});
				} else if (timeSpan < 1728e5) {//24小时内
					title = so.format('${0}小时内访客（${1} - ${2}）', parseInt(timeSpan / 36e5), so.dateFormat(firstDate, 'yyyy-MM-dd HH:00'), so.dateFormat(lastDate, 'yyyy-MM-dd HH:00'));
					newDatas = createData(function (date) {
						return so.dateFormat(date, 'dd日HH:mm');
					});
				} else if (timeSpan < 2592e6) {//1个月内
					title = so.format('${0}天内访客（${1}日 - ${2}日）', parseInt(timeSpan / 864e5), firstDate.getDate(), lastDate.getDate());
					newDatas = createData(function (date) {
						return so.padNumber(date.getDate()) + '日';
					});

				} else if (timeSpan <= 31536e6) {//1年内
					title = so.format('1年内访客（${0}年）', nowDateTime.getFullYear());
					newDatas = createData(function (date) {
						return so.padNumber(date.getMonth() + 1) + '月';
					});
				} else if (timeSpan <= 31536e8) {//100年内
					title = so.format('${0}年内访客（${1}年 - ${2}年）', parseInt(timeSpan / 31536e6), firstDate.getFullYear(), lastDate.getFullYear());
					newDatas = createData(function (date) {
						return date.getFullYear() + '年';
					});
				}
				echartsOption.title.text = title;
				echartsOption.xAxis[0].data = timeAxis;
				echartsOption.series[0].data = newDatas;
				userRecordChart.clear().setOption(echartsOption);
			}
		});
	}
});
