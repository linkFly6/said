require(['jquery'], function ($) {
    var     //绑定导航
    bindNavigation = function ($content, keyClass, openClass) {
        $content.find('.' + keyClass).each(function () {
            var $this = $(this);
            $(this.firstElementChild).click(function () {
                $this.toggleClass(openClass);
            });
        });
    };
    /*************************************************************************************
                                通用页面组件
    **************************************************************************************/

    $(function () {
        bindNavigation($('#example-navbar-collapse'), 'complex', 'open');

        var $saidMaskContainer = $('#said-page-mask'),//全局蒙板
            $saidMaskBox = $('#said-mask-box'),//显示的蒙板
            $maskContent = $('.said-mask-content'),//要放到全局蒙板下面所有的类
            $saidHelpBox = $('#said-help');//said全局帮助
        $saidMaskContainer.append($saidHelpBox);//追加到全局蒙板中
        $saidHelpBox.show(0);
        $('#said-help-btn').on('click', function () {
            $maskContent.hide(0);
            $saidHelpBox.show(0);
            $saidMaskContainer.fadeIn(200);
        });
        $saidMaskBox.on('click', function () {
            $saidMaskContainer.fadeOut(200);
        });
    });
});
define('said', ['jquery'], function ($) {
    var document = window.document,
        said = {};

    /*************************************************************************************
                                和业务相关的通用逻辑（注册在said命名空间）
    **************************************************************************************/


    return {
        ajax: function (url, data) {
            //jQuery.ajax的浅warpper
            return $.ajax(typeof url === 'object' ?
                url : {
                    url: url,
                    type: "post",
                    //contentType: "application/json; charset=utf-8",
                    //contentType: "application/json", //jQuery默认头是提交表单的："application/x-www-form-urlencoded; charset=UTF-8"
                    dataType: "json",
                    data: data //注意对内容进行编码
                });
        },
        dialog: new function () {
            var $saidModal = $('#said-g-modal'),//模态对话框
                $modalTitle = $('#said-g-modal-title'),
                $modalBody = $('#said-g-modal-body');
            return function (title, context) {
                if (context == null && title != null)
                    $modalBody.html(title);
                else {
                    $modalTitle.html(title || '');
                    $modalBody.html(context || '');
                }
                return $saidModal.modal('show');
            };
        }
    };


    /*************************************************************************************
                            和业务相关的通用逻辑（注册在window命名空间）
    **************************************************************************************/


    //window.$window = $(window);
    //window.$document = $(document);

});