define(['jquery', 'avalon'], function ($, avalon) {
    var template = '<div class="CLASS_CONTAINER" ms-visible="visible">\
                        <span class="CLASS_TEXT">{{text}}</span>\
                     <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>\
                      <input type="file" class="CLASS_FILEINPUT" ms-change="change($event)"/>\</div>';
    var widget = avalon.ui.upload = function (elem, data, vms) {
        var options = data.uploadOptions,
            $containerDOM = $(template),
            viewModel;
        viewModel = avalon.define(data.autoCompleteId, function (vm) {
            var display = function (isDisplay) {
                //isDisplay=true：显示、isDisplay=false：不显示、isDisplay==null：根据长度显示
                vm.display = isDisplay == true || (isDisplay == null && (len = vm.filter.length)) ? 'block' : 'none';
                vm.activeIndex = -1;
            };
            vm.visible = options.visible;

            vm.change = function (e) {

            };

            vm.$init = function () {
                elem.parentNode.replaceChild($containerDOM[0], elem);
                avalon.scan($containerDOM[0], [viewModel].concat(vms));
            };
            vm.$remove = function () {
                $containerDOM.remove();
                $containerDOM = null;
            };

        });
        return viewModel;
    };
    widget.defaults = {
        val: function () { },
        classContainer: 'so-upload-mask',
        classProgress: 'so-progress',
        classFile: 'hidden-file',
        visible: true,
        multiple: false,
        progress: true,
        size: 1048576,//默认1mb，<=0表示允许无限
        filters: '*',//默认允许上传所有文件，为数组的话则限定上传的数组后缀
        //['jpg', 'jpeg', 'jpe', 'bmp', 'png', 'gif'/*, 'image/png', 'image/bmp', 'image/gif', 'image/jpeg'*/],//默认是图片
        done: function () { },
        fail: function () { }
    };
    return widget;
});


