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
})(window);