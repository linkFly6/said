var app = angular.module('said', []).controller('formController', function ($scope) {
    'use strict';
    var article = $scope.article = {
        dirty: false
    };
    article.tags = [
        'javascript',
        'ECMAScript',
        'C#',
        '.NET',
        'jQuery',
        '.NET MVC',
        'Sql Server',
        'NodeJS'
    ];
    article.submitForm = function (saidForm) {
        saidForm.$setDirty();
        article.dirty = true;

    };
    article.deleteInfo = function () {
        alert('aa');
    };
    article.changeFileValue = function (value) {
        alert(value);
    };
}).filter('search', function () {
    //搜索
    return function (list, target, defValue) {
        defValue = defValue || '没有查询到相关结果，默认新增';
        var res = [], value = (target.$viewValue || '').toLowerCase();
        jQuery.each(list, function (i, item) {
            item.toLowerCase().indexOf(value) !== -1 && res.push(item);
            return res.length !== 10;
        });
        if (res.length === 0)
            res.push(defValue);
        return res;
    }
}).directive('queryselect', function () {
    return {
        link: function ($scope, elem, attr) {
            var input = elem.find('input'),
                res = elem.find('div'),
                list, i = -1, active = [], len = 0;
            input.bind('keydown', function (e) {
                switch (e.keyCode) {
                    case 40: {//down
                        list = res.children();
                        len = list.length;
                        active.length && active.removeClass('active');
                        if (i === len) i = -1;
                        if (i + 1 >= len) return i = -1;
                        active = list.eq(++i).addClass('active');
                    }
                        break;
                    case 38: {//up
                        list = res.children();
                        len = list.length;
                        active.length && active.removeClass('active');
                        if (i === -1) i = len;
                        if (i - 1 < 0) return i = len;
                        active = list.eq(--i).addClass('active');
                    }
                        break;
                    default:
                        i = -1;
                        break;

                }
            });
        }
    }
});
//文件上传
app.directive('inputfile', function () {
    return {
        //musicFile
        require: '?^ngModel',
        link: function ($scope, elem, attr, $model) {
            console.log($model);
            var inputs = elem.find('input'),//[input,hiddenInput(inputState)]
                progress = elem.find('.progress-bar'),//progress bar
                changeState = function (value) {
                    //改变上传进度方法
                    progress.css('width', value + '%');
                };
            inputs.eq(0).bind('change', function (event) {
                var file = this.files[0],
                    name = file.name,
                    size = file.size,
                    type = file.type || '',
                    //根据最后修改日期标志文件上传
                    id = (file.lastModifiedDate + "").replace(/\W/g, '') + size + type.replace(/\W/g, ''),
                    xhr = new XMLHttpRequest(),// XMLHttpRequest 2.0请求
                    action = $scope.fileConfig && $scope.fileConfig.action || '/Back/ImgFileUpload',
                    data = new FormData();
                data.append('name', encodeURIComponent(name));
                data.append('fileId', id);
                data.append('file', file.slice(0));
                xhr.open('post', action, true);
                xhr.upload.addEventListener("progress", function (e) {
                    //上传中
                    changeState(e.loaded / size * 100);
                }, false);
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.readyState === 200) {
                            try {
                                var json = JSON.parse(xhr.responseText);
                            } catch (e) {
                                //这是什么Error
                                $scope.fileConfig && $scope.fileConfig.error && $scope.fileConfig.error(id, 1);
                            }
                            //上传完成

                        }
                    } else {
                        //上传Error
                        $scope.fileConfig && $scope.fileConfig.error && $scope.fileConfig.error(id, 2);
                        //因为是UED，没有上传逻辑，所以先把代码放到Error中
                        inputs.eq(1).val('200');
                        elem.css('display', 'none');
                    }
                };
                xhr.send(data);
            });
        }
    };
});