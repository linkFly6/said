define('said.index', ['said', 'jquery', 'so', 'sweetalert', 'bsTable'], function (said, $, so, sweetalert) {
	var templates = {
		deleteArticle: {
			text: '您确定要删除文章《<span class="said-red said-bold"> ${0} </span>》么？<br/>该操作为<span class="said-red said-bold">逻辑删除</span>',
			ok: '删除文章《${0}》成功<br/>该操作为逻辑删除，仍可以在数据库中查阅到'
		},
		realDeleteArticle: {
			text: '您确定要永久删除文章《<span class="said-red said-bold"> ${0} </span>》么？<br/>该操作为<span class="said-red said-bold">物理删除，不可恢复</span>',
			ok: '删除文章《${0}》成功<br/>该操作为物理删除，不可恢复'
		}
	},
	deleteArticle = function (isRealDelete, id, title, callback) {
		sweetalert({
			title: '确认删除',
			text: so.format(isRealDelete ? templates.realDeleteArticle.text : templates.deleteArticle.text, title),
			html: true,
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: '确认删除',
			closeOnConfirm: false,
			cancelButtonText: '取消',
			//配置正在加载
			showLoaderOnConfirm: true
		}, function (isConfirm) {
			if (isConfirm) {
				said.ajax(isRealDelete ? Action.realDelete : Action.delele, {
					id: id
				}).done(function (result) {
					if (result.code === 0) {
						sweetalert({
							title: '删除成功',
							text: so.format(isRealDelete ? templates.realDeleteArticle.ok : templates.deleteArticle.ok, title),
							html: true,
							type: 'success'
						});
						callback(id);
					} else {
						sweetalert('删除异常', '服务器返回异常：' + result.msg, 'error');
					}
				}).fail(function () {
					sweetalert('删除异常', '网络连接异常', 'error');
				});
			}
		});
	}

	return function (Action) {
		$(function () {
			var $bsTable = $('#btTable').bootstrapTable({
				columns: [
				 //{ field: 'SaidId', title: 'ID', visible: true },
				 {
				 	field: 'STitle',
				 	title: '名&nbsp;&nbsp;&nbsp;称',
				 	valign: 'middle',
				 	sortable: true,
				 	formatter: function (value, row, index) {
				 		//console.log(row); //row可以访问到数据
				 		return ['<a target="_blank" href="/Said/', row.SaidId, '.html">', value, '</a>'].join('');
				 	}
				 },
				 {
				 	field: 'Song.SongName',
				 	title: '歌&nbsp;&nbsp;&nbsp;曲',
				 	valign: 'middle',
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'SPV',
				 	title: '浏&nbsp;&nbsp;&nbsp;览',
				 	valign: 'middle',
				 	sortable: true,
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'Date',
				 	title: '发布时间',
				 	sortable: true,
				 	valign: 'middle',
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'Likes',
				 	title: '喜&nbsp;&nbsp;&nbsp;欢',
				 	valign: 'middle',
				 	formatter: function (value, row, index) {
				 		return value;
				 	}
				 },
				 {
				 	field: 'SaidId',
				 	title: '操&nbsp;&nbsp;&nbsp;作',
				 	formatter: function (value, row, index) {
				 		return ['<a class="btn btn-info fa fa-edit" data-id="', value, '" href="/Back/Said/Edit/', value, '" title="编辑"></a>&nbsp;&nbsp;&nbsp;<a class="btn btn-default fa fa-trash-o btn-delete" data-title="', row.STitle, '" data-id="', value, '" title="逻辑删除"></a>&nbsp;&nbsp;&nbsp;<a class="btn btn-danger fa fa-trash-o btn-delete" data-is-real="1" data-title="', row.STitle, '" data-id="', value, '" title="物理删除（永久删除）"></a>'].join('');
				 	}
				 }
				],
				pageSize: 20,
				pageList: [20, 50, 100, 150, 200, 400, 600, 1000],
				data: articlesDatas
			}).on('click', '.btn-delete', function () {
				var $elem = $(this), dataId = $elem.data('id'), dataTitle = $elem.data('title'), isRealDelete = $elem.data('isReal');
				deleteArticle(isRealDelete, dataId, dataTitle, function () {
					$bsTable.bootstrapTable('remove', {
						field: 'SaidId',
						values: [dataId + '']//bootStrapTable的bug，因为dataId是被jQuery转成了数字，导致bootStrapTable检测BlogId字段是否相等的时候发生了bug
					});
				});
			});
		});
	}




});