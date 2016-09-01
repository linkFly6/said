require(['jquery', 'so'], function ($, so) {
    $(function () {
        //导航效果
        var $navs = $('#nav-flip').find('li'),
            $navHover = $('#nav-hover'), activeIndex = 0;
        if ($navs.length && $navHover.length) {
            $navs.each(function (i) {
                var $nav = $(this);
                if ($nav.hasClass('nav-active')) {
                    activeIndex = i;
                }
                $nav.on('mouseenter', function () {
                    //导航菜单是70px一个滑动单位
                    $navHover.css('left', 70 * i + 'px');
                }).on('mouseleave', function () {
                    //导航菜单是70px一个滑动单位
                    $navHover.css('left', 70 * activeIndex + 'px');
                });
            });
        }
    });
});