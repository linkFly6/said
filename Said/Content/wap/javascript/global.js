$(function () {
    //导航展开收起菜单按钮
    var $navBtn = $('#nav-btn'),
        $navMask = $('#navMask'),
        $html = $('html'),
        $navBar = $('#nav-bar');
    $navBtn.on('click', function () {
        if ($navBar.hasClass('open')) {
            $navBar.removeClass('open')
            $navMask.removeClass('open');
            setTimeout(function () {
                $html.removeClass('lock');
                $navMask.hide();
            }, 600);//蒙板动画是0.5s
        } else {
            $html.addClass('lock');
            $navBar.addClass('open');
            $navMask.show();
            setTimeout(function () {
                //显示的一瞬间直接追加open会让动画不生效
                $navMask.addClass('open');
            });
        }
    });
});