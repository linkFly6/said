require(['jquery'], function ($) {
    $(function () {
        var $blogCateBox = $('.blog-cate-box'),
            blogCateBoxHeight = $blogCateBox.height(),
            $blogCategory = $('.blog-category'),
            $cateBtn = $('.b-cate-btn')
        $cateBtn.on('click', function () {
            if ($cateBtn.hasClass('open')) {
                Umeng.event('分类', '收起', '收起了 Blog 页的分类', 0, 'b-cate-txt');
                $cateBtn.removeClass('open');
                $blogCategory.height(0);
            } else {
                Umeng.event('分类', '展开', '展开了 Blog 页的分类', 0, 'b-cate-txt');
                $cateBtn.addClass('open');
                $blogCategory.height(blogCateBoxHeight);
            }
        });
        if ($cateBtn.hasClass('open')) {
            $blogCategory.height(blogCateBoxHeight);
        }
    });
});