require(['jquery'], function ($) {
    $(function () {
        var $blogCateBox = $('.blog-cate-box'),
            blogCateBoxHeight = $blogCateBox.height(),
            $blogCategory = $('.blog-category'),
            $cateBtn = $('.b-cate-btn')
        $cateBtn.on('click', function () {
            if ($cateBtn.hasClass('open')) {
                $cateBtn.removeClass('open');
                $blogCategory.height(0);
            } else {
                $cateBtn.addClass('open');
                $blogCategory.height(blogCateBoxHeight);
            }
        });
        if ($cateBtn.hasClass('open')) {
            $blogCategory.height(blogCateBoxHeight);
        }
    });
});