require('index', ['jquery', 'so'], function ($, _) {

    return function (Resource, Action, maxPage) {
        $(function () {
            var currentPageIndex = 2,
                $nextPage = $('#said-nextPage'),//下一页按钮
                $loading = $('#said-loading'),//加载中
                $nextPageText = $nextPage.find('span'),//下一页按钮文案
                $saidListBox = $('#said-list-box'),//Said列表容器
                htmlTemplates = {
                    said: '<a class="said-item clear" href="${url}">\
                        <div class="item-bg" style="background-image:url(${imgUrl})"></div>\
                        <div class="item-context">\
                            <div class="item-article">\
                                <h2 class="said-ellipsis">${title}</h2>\
                                <div class="article-txt line-clamp line2">${summary}</div>\
                                <div class="item-more">\
                                    <span class="fa fa-heart-o" title="like"><i>${likes}</i></span>\
                                    <time>${date}</time>\
                                </div>\
                            </div></div></a>'
                };
            $nextPage.on('click', function () {
                $loading.show();
                $nextPage.hide();
                $.ajax({
                    url: Action.getSaidList,
                    type: "post",
                    //contentType: "application/json; charset=utf-8",
                    //contentType: "application/json", //jQuery默认头是提交表单的："application/x-www-form-urlencoded; charset=UTF-8"
                    dataType: "json",
                    data: { limit: 10, offset: parseInt((currentPageIndex - 1) * 10) }
                }).done(function (data) {
                    if (data.total > 0) {
                        var htmls = [];
                        data.rows.forEach(function (item) {
                            htmls.push(_.format(htmlTemplates.said, {
                                url: Action.said + item.SaidId + '.html',
                                imgUrl: Resource.said + item.Image.IFileName,
                                title: item.STitle,
                                summary: item.SSummaryTrim,
                                likes: item.Likes,
                                date: _.dateToLocal(item.Date, window.dateNow, 'yyyy-MM-dd')
                            }));
                        });
                        $saidListBox.append(htmls.join(''));
                        if (currentPageIndex >= maxPage) {
                            $nextPage.parent().hide();
                        } else {
                            currentPageIndex++;
                            $nextPage.show();
                            $nextPageText.html('点击加载更多');
                        }
                    } else {
                        $nextPage.show();
                        $nextPageText.html('加载失败，点击重新加载');
                    }

                }).fail(function () {
                    $nextPage.show();
                }).always(function () {
                    $loading.hide();
                });
            });

        });
    }

});