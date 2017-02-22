require(['jquery'], function ($) {
    var $bannerItems = $('#banner-box').find('li'),//banner项
        $rings = $('#banner-footer').find('li'),//banner小圆点
        $arrows = $('.banner-arrow'),//左右翻页banner
        $currBannerItem = $bannerItems.eq(0),//当前显示的banner
        maxBannerIndex = $bannerItems.length - 1,//banner最大值
        currBannerIndex = 0,//banner当前滑动页
        intervalId,
        start = function () {//banner动画开始
            clearInterval(intervalId);
            intervalId = setInterval(function () {
                currBannerIndex++;
                if (currBannerIndex > maxBannerIndex) {
                    toggleBanner(0);
                } else
                    toggleBanner(currBannerIndex);
            }, 8000);
        },
        stop = function () {//banner动画停止
            clearInterval(intervalId);
        },
        //切换banner
        toggleBanner = function (index) {
            currBannerIndex = index;
            $currBannerItem.stop().animate({ 'opacity': 0, 'z-index': 1 }, 500);
            $currBannerItem = $bannerItems.eq(index).stop().animate({ 'opacity': 1, 'z-index': 2 }, 500);
            $rings.removeClass('active').eq(index).addClass('active');
        };

    //点击小按钮
    $rings.each(function (i) {
        $(this).on('click', function () {
            if (currBannerIndex === i) return;
            toggleBanner(i);
        }).hover(function () {
            stop();
        }, function () {
            start();
        });
    });
    $arrows.each(function (i) {
        var func = i ?
            function () {//向右
                Umeng.event('轮播图', '向右', '无', 0, 'arrow-right');
                return currBannerIndex == maxBannerIndex ? 0 : currBannerIndex + 1;
            } :
            function () {//向左
                Umeng.event('轮播图', '向左', '无', 0, 'arrow-left');
                return currBannerIndex == 0 ? maxBannerIndex : currBannerIndex - 1;
            };
        $(this).on('click', function () {
            toggleBanner(func());
            start();
        });
    });
    start();
});