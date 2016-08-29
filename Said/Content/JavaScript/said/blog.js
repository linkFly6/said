define(['jquery'], function ($) {
    $(function () {
        var $nav = $('#a-nav'),
            $main = $('#blog-main'),
            mainTop = $main.offset().top,
            windowHeight = window.innerHeight;
        $(window).on('scroll', function () {
            if (window.scrollY > mainTop) {
                $nav.addClass('fixed');
            } else
                $nav.removeClass('fixed');
        });
    });

    var comments = {
        checkEmail: function (email) {
            var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
            return reg.test(email);
        },
        checkSite: function (site) {
            var reg = /^((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/;
            return reg.test(site);
        },
        submit: function (blogId, email, nickName, name, context, commentsId, toReply) {

        }
    };

    $commentContent = $('#comment-content');
    $commentContent.on('click', '')
})