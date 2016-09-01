define('said.edit', ['said', 'jquery', 'so', 'avalon', 'source', 'dialog', 'sweetalert', 'showdown', 'upload', 'avalonUpload', 'groupInput'], function (said, $, so, avalon, source, dialog, sweetalert, showdown) {
    'use strict';
    var slice = Array.prototype.slice;
    var converter = new showdown.Converter({ /*extensions: ['github'],*/
        omitExtraWLInCodeBlocks: false,//配置生成的code是否最后生成一个\n
        //noHeaderId: true//是否禁用h1-h7生成id
        prefixHeaderId: 'bt-',//设置h1-h7的的id（会进行自增，默认为title，第二个为title1）

        /*
			启用从降级语法中设置图像尺寸
			![foo](foo.jpg =100x80)     100*80px
			![bar](bar.jpg =100x*)      设置height为"auto"
			![baz](baz.jpg =80%x5em)    width=80%,height=5em
		*/
        parseImgDimensions: true,
        /*
			是否自动转换站点
			www.said.com => <a href="www.said.com">www.said.com</a>
		*/
        //simplifiedAutoLink: false,

        /*
			支持删除线
			~~said~~  => <del>said</del>
		*/
        strikethrough: true,

        /*
			支持表格
			| h1    |    h2   |      h3 |
			|:------|:-------:|--------:|
			| 100   | [a][1]  | ![b][2] |
			| *foo* | **bar** | ~~baz~~ |
		*/
        tables: true,

        //tablesHeaderId: true,//为表格的表格头设置一个表格ID

        //smoothLivePreview: true//防止在实时预览输入中，由于不完整输入造成显示起来怪异的影响

        //smartIndentationFix: true//（尝试修复）当涉及到ES6模板字符串中缩进代码的格式

    }),
		encode = function (value) {
		    return encodeURIComponent(value == null ? '' : value);
		},
		errorHash = {
		    'sTitle': ['（￣工￣lll） 文章标题不正确', '你忘记填写文章标题了... '],
		    'sContext': ['(｡☉౪ ⊙｡)  文章正文不正确', '大哥你连正文都木有发表了文章谁看啊...赶紧检查一下  '],
		    'sImg': [' (≖ ‿ ≖)✧ 文章插图不正确', 'Said规定所有的文章必须要有灵犀又生动的插图哟...赶紧挑张图片让文章更加的精彩'],
		    'sSummary': [' (￣▽￣)~* 文章描述不正确', '文章描述是一定要有的，没有文章描述诱惑，别人也许就不会读文章了'],
		};
    return function (saidId, Action, Source, DataCenter) {
        $(function () {


            var checkEmptyValue = function (key, title, summary) {
                if (!vmSaid[key]) {
                    sweetalert(title, summary, "warning");
                    return false;
                }
                return true;
            }

            var vmSaid = avalon.define({
                $id: 'said',
                saidId: saidId,
                sTitle: '',
                sTag: '',
                sSummary: '',
                sReprint: '',
                sScript: '',
                sIsTop: '',
                sCSS: '',
                sContext: '',
                sImg: '',
                sName: '',
                classify: '',
                checkFile: false,
                submitState: false,
                $skipArray: ['sTag'],
                checkFileName: function () {
                    //考虑性能，DOM缓存
                    var $cache, key = 'bName';
                    return function (elem, value) {
                        !$cache && ($cache = $(elem).tooltip({ trigger: 'manual' }));
                        vmSaid.checkFile = !!(value && ~DataCenter.files.indexOf(value.toLowerCase()));
                        $cache.tooltip(vmSaid.checkFile ? 'show' : 'hide');
                    }
                }(),
                check: function () {
                    var temp;
                    return ['sTitle', 'sContext', 'sImg', 'sSummary'].every(function (key) {
                        temp = errorHash[key];
                        return checkEmptyValue(key, temp[0], temp[1]);
                    });
                },
                reset: function () {
                    setTimeout(function () {
                        window.location.href = '/Back/Said';
                    }, 1000);
                },
                submit: function (isPrivate) {
                    //锁定按钮状态
                    if (vmSaid.submitState) return;
                    if (!(vmSaid.submitState = vmSaid.check())) return;
                    if (!vmSong.songId) {
                        sweetalert('没有歌曲id', '请选择正确的歌曲信息', "warning");
                        return;
                    }
                    if (!vmSaid.sImg) {
                        sweetalert('没有文章缩略图', '请上传正确的文章缩略图', "warning");
                        return;
                    }
                    //said.dialog(converter.makeHtml(vmSaid.sContext));
                    vmSaid.submitState = true;

                    var sSummary = vmSaid.sSummary.split('\n').map(function (item) {
                        return '<p>' + item + '</p>';
                    }).join('');

                    said.ajax(Action.form, {
                        'SaidId': vmSaid.saidId,
                        'STitle': encode(vmSaid.sTitle),
                        'SSummary': encode(vmSaid.sSummary),
                        'SSummaryTrim': encode(sSummary),
                        'SHTML': encode(converter.makeHtml(vmSaid.sContext)),
                        'SReprint': encode(vmSaid.sReprint || false),
                        'SScript': encode(vmSaid.sScript),
                        'SIsTop': encode(vmSaid.sIsTop || false),
                        'SCSS': encode(vmSaid.sCSS),
                        'SongId': encode(vmSong.songId),
                        'SContext': encode(vmSaid.sContext),
                        'ImageId': encode(vmSaid.sImg),
                        'IsPrivate': isPrivate ? 1 : 0,//是否私有
                        'SName': encode(vmSaid.sName),
                    }).done(function (data) {
                        if (!data.code) {//done
                            sweetalert({
                                title: '修改成功',
                                text: so.format('喜大普奔，修改文章《${0}》成功', vmSaid.sTitle),
                                type: "success"

                            }, function () {
                                vmSaid.reset();
                            });
                        } else {
                            sweetalert({
                                title: "数据异常",
                                text: so.format('修改异常，异常代码 - ${1}${0}', data.msg.split(',').map(function (msg) {
                                    return '<p>' + msg + '</p>';
                                }).join(''), data.code),
                                html: true,
                                type: "error"
                            });
                        }

                    }).fail(function (data) {
                        sweetalert("服务器异常", so.format('修改异常，异常代码：${0}（${1}）', data.status, data.statusText), "error");
                    }).always(function () {
                        vmSaid.submitState = false;
                    });

                }
            });




            var vmSong = avalon.define({
                $id: 'song',
                songId: '',
                songArtist: '',
                songAlbum: '',
                songFileName: '',
                songName: '',
                songImg: '',
                imgSrc: '',
                groupInput: {
                    datas: DataCenter.songs,
                    zIndex: 4,
                    custom: false,
                    values: localSongData,
                    callback: function (value) {
                        //选择了歌曲
                        if (value && value.data) {
                            var songData = value.data;
                            //找到了歌曲信息
                            vmSong.songId = songData.id;
                            vmSong.songArtist = songData.artist;
                            vmSong.songAlbum = songData.album;
                            vmSong.songFileName = songData.fileName;
                            vmSong.songImg = songData.img;
                            vmSong.imgSrc = Source.songImg + songData.img;
                        } else {
                            //database.val('song.id', '');
                            vmSong.songId = vmSong.songArtist = vmSong.songAlbum = vmSong.songFileName = vmSong.songImg = vmSong.imgSrc = '';
                        }
                    }
                }
            });



            //upload

            var _summaryDialog = $.source({
                loadUrl: '/Back/Image/GetImagesList',
                path: Source.summaryImg,
                type: Source.saidImageType,
                uploadUrl: Action.uploadSaidImg,
                deleteUrl: '/Back/Source/RealDeleteImage',//这个是物理删除，测试用这个
                multiple: false,
                //deleteUrl: Action.deleteImage, //这个是逻辑删除，上线用这个
                callback: function (data) {
                    vmUpload.data = data;
                    var imgSrc = Source.summaryImg + data.IName;
                    vmUpload.img = data.IName;
                    vmUpload.imgSrc = imgSrc;
                    vmSaid.sImg = data.ImageId;
                    //database.val('sImg', data.ImageId).val('summary.imgSrc', imgSrc);
                }
            });
            var vmUpload = avalon.define({
                $id: 'uploadController',
                imgSrc: '',
                $skipArray: ['img'],
                dialog: function (id) {
                    _summaryDialog.show();
                },
                clear: function () {
                    //database.remove('sImg')
                    //database.remove('summary.imgSrc');
                    vmSaid.sImg = null;
                    vmUpload.imgSrc = vmUpload.img = '';
                }
            });

            avalon.scan();

            //var temp = Object.keys(vmSaid.elem).map(function (key, value) {
            //    return key.split('-')[0];
            //});
            //console.log(temp);

            //还原要编辑的数据
            ["sTitle", "sContext", "sSummary", "sName", "sScript", "sCSS", "sReprint", "sIsTop"].forEach(function (propertiePrefixName) {
                var elem = vmSaid.elem[propertiePrefixName + '-h'];
                if (elem && elem.value.length)
                    vmSaid[propertiePrefixName] = (propertiePrefixName == 'sIsTop' || propertiePrefixName == 'sReprint') ? elem.value === 'True' ? true : false : elem.value;
            });


            //图片单独处理
            //["ImageId", "IFileName"];
            if (vmSaid.elem['ImageId-h']) {
                var imgSrc = Source.summaryImg + vmSaid.elem['IFileName-h'].value;
                vmUpload.img = vmSaid.elem['IFileName-h'].value;
                vmUpload.imgSrc = imgSrc;
                vmSaid.sImg = vmSaid.elem['ImageId-h'].value;
            }

            //歌曲单独处理
            var localSongData = [];
            if (vmSaid.elem["SongId-h"]) {
                var songId = vmSaid.elem["SongId-h"].value;
                so.each(DataCenter.songs, function (item) {
                    if (item.data.id === songId) {
                        localSongData.push(item);
                    }
                });
            }
            if (localSongData.length) {
                vmSong.songId = localSongData[0].data.id;
                vmSong.songArtist = localSongData[0].data.artist;
                vmSong.songName = localSongData[0].data.name;
                vmSong.songAlbum = localSongData[0].data.album;
                vmSong.songFileName = localSongData[0].data.fileName;
                vmSong.songImg = localSongData[0].data.img;
                vmSong.imgSrc = Source.songImg + localSongData[0].data.img;
            }
        });
    }

});