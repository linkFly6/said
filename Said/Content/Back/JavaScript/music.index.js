define('music.index', ['said', 'jquery', 'avalon', 'so', 'sweetalert', /*'dialog',*/ 'avalonUpload', 'bs-date', 'source'], function (said, $, avalon, _, sweetalert, /*dialog,*/ upload) {
	'use strict';
	//_.Database('back.Music').clear();

	//给avalon注册过滤器
	avalon.filters.toDate = function (str, format) {
		return str ? _.dateFormat(str, format) : '';
	};

	avalon.filters.ToSongTime = function (str) {
		return str ? _.parseTime(+str) : '';
	};

	avalon.filters.ToSize = function (str) {
		return str ? _.parseBit(str) : '';
	}
	return function (Action, Source) {
		$(function () {
			//一个干净的歌曲模型，后面有歌曲详情vm和歌曲表单vm需要搀和它
			var songPlainModel = {
				SongId: '',
				SongName: '',
				SongLikeCount: '',
				FileType: '',
				SongArtist: '',
				SongAlbum: '',
				ReleaseDate: '',
				Duration: '',
				ImageId: '',
				IName: '',
				SongSize: '',
				ReferenceCount: '',
				SongFileName: ''
			};

			var database = _.Database('back.Music'),
				hasLocalSong = !!database.val('SongFileName'),
				localSong = {};
			$.each(songPlainModel, function (key) {
				localSong[key] = database.val(key) || '';
			});
			localSong['SongSizeText'] = database.val('SongSizeText') || '';
			localSong['ImagePath'] = database.val('ImagePath') || '';
			localSong['DurationText'] = database.val('DurationText') || '';

			//歌曲详情vm，利用extend实现多态
			var vmCurrData = avalon.define($.extend({}, songPlainModel, { $id: 'currData', Date: '', SongFileNamePath: Source.songPath }));

			//歌曲表单vm
			var vmSong = avalon.define($.extend({}, songPlainModel, {
				SongSizeText: '',
				DurationText: '',
				ImagePath: '',
				SongFileNamePath: Source.songPath
			}, localSong, {
				$id: 'song',
				$skipArray: ['FileType', 'SongLikeCount'],
				isUploadedFile: hasLocalSong,
				saveTolocalStorage: function (key, value) {
					if (value) database.val(key, value);
				},
				reset: function () {
					$.extend(vmSong, songPlainModel, { SongSizeText: '', DurationText: '', ImagePath: '', SongFileNamePath: Source.songPath, SongFileName: '', IName: '' });
					$dateInput.val('');
					database.clear();
					vmSong.isUploadedFile = false;
				},
				check: function () {
					var validateIsOk = true;
					$.each(songPlainModel, function (key, value) {
						if (key !== 'SongId' && key !== 'SongLikeCount' && key !== 'ReferenceCount' && !vmSong[key]) {
							sweetalert('存在不正确的表单项', '存在不正确的表单项，请仔细检查未填项', 'warning');
							return validateIsOk = false;
						}
					});
					return validateIsOk;
				},
				submit: function () {
					if (!vmSong.check()) return;
					var data = {};
					$.each(songPlainModel, function (key) {
						data[key] = vmSong[key];
					});
					said.ajax(Action.addSong, data).done(function (result) {
						if (result.code === 0) {
							sweetalert('添加歌曲成功', '喜大普奔，添加歌曲成功！', 'success');
							//检查这里
							vmModel.addModel(_.extend(true, data, {
								SongId: result.data,
								ReferenceCount: 0,
								SongLikeCount: 0,
								Image: SelectImageData
							}));
							vmSong.reset();
						} else {
							sweetalert('服务器返回异常', '错误信息：' + result.msg, 'error');
						}
					}).fail(function () {
						sweetalert('网络连接异常', '向服务器发送添加歌曲请求异常', 'error');
					});
				},
				//删除歌曲文件
				remove: function () {
					if (vmModel.isLoading) return;
					vmModel.isLoading = true;
					said.ajax(Action.realDeleteFile, {
						fileName: vmSong.SongFileName
					}).done(function (result) {
						if (result.code === 0) {
							vmSong.reset();
						} else {
							sweetalert('服务器删除资源异常', '返回信息：' + result.msg, 'error');
						}
						vmModel.isLoading = false;
					}).fail(function (data) {
						vmModel.isLoading = false;
						sweetalert('网络连接异常', '向服务器发送删除歌曲请求异常', 'error');
					});

				},
				showSource: function () {
					_songImageDialog.show();
				},
				//widget
				$uploadMusic: {
					classFile: 'hidden-file',
					//name: 'testFile',
					filters: Source.filters,
					accept: 'audio/mp3,audio/mpeg,audio/ogg,audio/wav',
					url: Action.upload,
					text: '添加音乐',
					classContainer: 'upload-mask',
					classText: 'upload-text',
					classProgress: 'upload-progress',
					size: Source.maxSize,
					//选择了文件
					selected: function (file) {
						//创建本地url
						var url = URL.createObjectURL(file);
						//拿到歌曲时长
						$player.attr('src', url);
					},
					done: function (vm, data, error, e) {
						if (error) {
							sweetalert('上传失败', '错误信息：' + error.msg, 'error');
							return;
						}
						if (data.code) {
							sweetalert('服务器返回异常', '异常信息：' + data.msg, 'error');
						} else {
							sweetalert('上传成功', '喜大普奔，上传音乐文件成功！', 'success');
							var fileName = data.msg;
							data = _.parseJSON(data.data);
							var model = {
								SongFileName: fileName,
								SongName: data.Title,
								SongAlbum: data.Album,
								SongArtist: data.Artists,
								ReleaseDate: '',
								//TODO 图片为默认
								IName: '',
								FileType: data.Type,
								Duration: parseInt($player[0].duration),
								DurationText: _.parseTime($player[0].duration),
								SongSize: data.Size,
								SongSizeText: _.parseBit(data.Size)
							};
							$.extend(vmSong, model);
							//本地存储
							_.each(model, function (key, value) {
								database.val(key, value);
							});
							vmSong.isUploadedFile = true;
						}
						return true;
					},
					fail: function (vm, data) {
						sweetalert('上传失败', '错误消息：' + data.msg, 'error');
					}
				}

			}));

			//选择图片
			var SelectImageData = database.val('selectImage');
			var _songImageDialog = $.source({
				loadUrl: Action.GetImagesList,//'/Back/Source/GetImagesList'
				path: Source.image,
				type: Source.songImageType,
				uploadUrl: Action.uploadImage,
				deleteUrl: Action.realDeleteImage,
				multiple: false,
				accept: 'image/*',
				//deleteUrl: Action.deleteImage, //这个是逻辑删除，上线用这个
				callback: function (data) {
					var imgSrc;
					if (data) {
						SelectImageData = data;
						imgSrc = Source.getImage(data.IFileName);
						vmSong.IName = data.IFileName;
						vmSong.ImagePath = imgSrc;
						vmSong.ImageId = data.ImageId;
						database.val('ImageId', data.ImageId).val('IName', data.IFileName).val('ImagePath', imgSrc).val('selectImage', SelectImageData);
					} else {
						SelectImageData = null;
						vmSong.IName = vmSong.ImagePath = '';
						database.val('ImageId', '').val('IName', '').val('ImagePath', '').val('selectImage', '');
					}
				}
			});



			var vmModel = avalon.define({
				$id: 'model',
				isAdd: hasLocalSong,
				query: _.debounce(function (keywords) {
					//查询，函数节流
					if (!keywords) {
						vmModel.load(1);
						return;
					}
					vmModel.datas = vmModel.caches.filter(function (item) {
						return ~((item.SongName + item.SongAlbum + item.SongArtist).toLowerCase().indexOf(keywords));
					});
					vmModel.resetActive();
					vmModel.skipPage(self.pageIndex = 1, self.sumPage);
				}, 300),
				searchText: '',
				multiple: false,
				activeIndex: -1,
				sum: 0,
				isLoading: false,
				datas: [],
				caches: [],//已经翻页加载过的数据就不要再加载了
				toggleForm: function (isAdd) {
					vmModel.isAdd = !isAdd;
				},
				deleteModel: function (e, item, i) {
					sweetalert({
						title: '确定删除？',
						text: '您确定要永久删除歌曲【<span class="said-red said-bold"> ' + item.SongName + ' </span>】么？',
						html: true,
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: '确认删除',
						closeOnConfirm: false,
						cancelButtonText: '取消',
						//配置正在加载
						showLoaderOnConfirm: true
					}, function (isConfirm) {
						if (isConfirm) {
							if (item.ReferenceCount > 0) {
								sweetalert('删除歌曲异常', '歌曲正在被引用，禁止删除！', 'warning');
								return;
							}
							said.ajax(Action.realDelete, {
								id: item.SongId
							}).done(function (result) {
								if (result.code === 0) {
									sweetalert('删除歌曲成功', '删除歌曲成功', 'success');
									vmModel.datas.splice(i, 1);
									//更新缓存池
									var index = vmModel.offset + i;
									if (vmModel.caches[index]) vmModel.caches.splice(index, 1);
									vmModel.resetActive();
								} else {
									sweetalert('服务器删除歌曲异常', '错误信息：' + result.msg, 'error');
								}
							}).fail(function () {
								sweetalert('网络连接异常', '向服务器发送删除请求发生异常', 'error');
							});
						}
					});
				},
				addModel: function (item) {
					item.img = _.imgLoad.DEFAULTS.load;
					_.imgLoad({
						src: Source.getImage(item.Image.IName),
						done: function (url) {
							item.img = url;
						},
						fail: function (url) {
							item.img = url;
						}
					});
					vmModel.caches.unshift(item);
					vmModel.datas.unshift(item);
					vmModel.activeItem(item, 0);
				},
				convertSize: function (size) {//byte
					if (!size) return '未知';
					size = size / 1024;
					if (size > 1024)
						return (size / 1024).toFixed(2) + 'MB';
					return size.toFixed(2) + 'KB';
				},
				resetActive: function () {
					vmModel.activeIndex = -1;
					vmCurrData.SongId = '';
				},
				activeItem: function (item, i) {
					vmModel.activeIndex = i;
					_.each(songPlainModel, function (key) {
						vmCurrData[key] = item[key];
					});
				},
				/*分页*/
				limit: 24,//个数
				offset: 0,//数据起点
				pageIndex: 1,//当前页码
				pages: [],
				sumPage: 0,//总页码
				$skipArray: ['limit', 'offset', 'caches'],
				skipPage: function (pageIndex, sumPage) {
					//console.log(pageIndex, sumPage);
					var pages = [],
						len = 0,
						i = 0;
					if (sumPage - pageIndex >= 5) {
						if (pageIndex > 3) {
							i = pageIndex - 2;
							len = pageIndex + 2;
						} else {
							i = 1;
							len = 5;
						}

					} else if (sumPage <= 5) {
						i = 1;
						len = sumPage;
					} else {
						i = sumPage - 4;
						len = sumPage;
					}
					for (; i <= len; i++) {
						pages.push(i);
					}
					//console.log(pages);//TODO 分页还要再调
					this.pages = pages;
				},
				toTop: function () {
					window.scrollTo(0, 0);
				},
				//歌曲不会非常多，所以直接加载全部就可以了
				loadAll: function () {
					var self = vmModel,
						pages = [];
					vmModel.isLoading = true;
					said.ajax(Action.getList, null).done(function (res) {
						if (res.total < 1) {
							vmModel.pages = [];
							vmModel.isLoading = false;
							return;
						};
						//vmModel.resetActive();
						self.sum = res.total;
						self.sumPage = res.total % self.limit === 0 ? res.total / self.limit : parseInt(res.total / self.limit) + 1;
						vmModel.datas = [];
						res.datas.forEach(function (item, i) {
							//只能先处理res.datas，再赋值到vmModels.datas，否则会触发：TypeError: vmModel.datas[i] is undefined，因为浏览器的缓存！这里早早就触发了，但其实vmModel.datas还没有被赋值
							item.img = _.imgLoad.DEFAULTS.load;
							_.imgLoad({
								src: Source.getImage(item.Image.IName),
								done: function (url) {
									vmModel.datas[i] ? vmModel.datas[i].img = url : item.img = url;
								},
								fail: function (url) {
									vmModel.datas[i] ? vmModel.datas[i].img = url : item.img = url;
								}
							});
						});
						vmModel.datas = res.datas.slice(0, self.limit);
						vmModel.caches = vmModel.caches.concat(res.datas);
						vmModel.isLoading = false;
						self.skipPage(self.pageIndex, self.sumPage);
					}).fail(function () {
						vmModel.isLoading = false;
						sweetalert('加载数据异常', '加载数据异常', 'warning');
					});
				},
				load: function (pageIndex, keywords) {
					var self = vmModel,
						pages = [];
					//检查datas里面有没有
					if (pageIndex) {
						self.offset = parseInt((pageIndex - 1) * self.limit);
						self.pageIndex = pageIndex;
					}
					//console.log(self.offset, self.limit);
					vmModel.isLoading = true;
					vmModel.toTop();
					if (vmModel.caches[self.offset]) {//缓存池里有
						vmModel.resetActive();
						vmModel.datas = vmModel.caches.slice(self.offset, self.offset + self.limit);
						self.skipPage(self.pageIndex, self.sumPage);
					} else {
						sweetalert('加载数据异常', '缓存池里没有数据', 'warning');
					}
					vmModel.isLoading = false;
				}
			});

			vmModel.$watch('searchText', function (keywords) {
				vmModel.query(keywords.trim().toLowerCase());
			});

			avalon.scan();
			//绑定date_input
			var $dateInput = $(vmSong.elem.ReleaseDate).datetimepicker({
				minView: 'month'
			}).on('changeDate', function (e) {
				database.val('ReleaseDate', vmSong.ReleaseDate = e.date.getTime());
			}),
			_releaseDateLocalValue = database.val('ReleaseDate');
			if (_releaseDateLocalValue) $dateInput.val(_.dateFormat(_releaseDateLocalValue, 'yyyy-MM-dd'));


			//隐藏的音乐播放器，由它来获取时长
			var $player = $(vmModel.elem.player);


			vmModel.loadAll();
			//console.dir(avalon.vmodels);
			//setTimeout(function () {

			//}, 300)
		});
	}

})