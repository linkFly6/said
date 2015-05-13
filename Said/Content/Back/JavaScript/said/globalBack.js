(function (window, undefined) {
    var so = window.so,
        $ = window.jQuery,
        said = {},
        //绑定导航
        bindNavigation = function ($content, keyClass, openClass) {
            $content.find('.' + keyClass).each(function () {
                var $this = $(this);
                $(this.firstElementChild).click(function () {
                    $this.toggleClass(openClass);
                });
            });
        };
    $(function () {
        bindNavigation($('#example-navbar-collapse'), 'complex', 'open');
    });


    /*************************************************************************************
                                和业务相关的通用逻辑
    **************************************************************************************/

    said.ajax = function (url, data) {
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
    };
    window.said = said;
    //window.$window = $(window);
    //window.$document = $(document);
})(window);