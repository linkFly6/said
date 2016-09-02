define('article.index', ['jquery', 'so'], function ($, _) {
    /*
<a class="said-item" href="${url}">
    <div class="item-bg" style="background-image:url(${base}${img})"></div>
    <div class="item-context">
        <div class="item-article">
            <h2>${title}</h2>
            <div class="item-music flex-right"><span class="said-ellipsis song flex-item-14 flex-left">${name}</span><span class="singer flex-item-9 said-ellipsis">${artist}</span> 
            </div>
            <div class="article-txt line-clamp line2">${summary}</div>
            <div class="item-more"><span class="fa fa-eye"><i class="globalFont">${pv}</i></span> 
                <time class="fa fa-calendar-o time"><i class="globalFont">${date}</i>
                </time>
            </div>
        </div>
    </div>
</a>
    */
    var htmlTemplates = '<a class="said-item" href="${url}"><div class="item-bg" style="background-image:url(${base}${img})"></div><div class="item-context"><div class="item-article"><h2>${title}</h2><div class ="item-music said-ellipsis"><i class ="fa fa-music"></i>${songname}&nbsp;-&nbsp;${artist}</div><div class="article-txt line-clamp line2">${summary}</div><div class="item-more"><span class="fa fa-eye"><i class="globalFont">${pv}</i></span>&nbsp;<time class="fa fa-calendar-o time"><i class="globalFont">${date}</i></time></div></div></div></a>';
    var load = function (currrPageIndex, limit, requestUrl) {
        return $.ajax({
            url: requestUrl,
            type: "get",
            dataType: "json",
            data: { limit: limit, offset: parseInt((currentPageIndex - 1) * limit) }
        });
    },
    currentPageIndex = 1;

    return function (maxPage, limit, requestUrl, actionBase, imgBase) {
        $(function () {
            var $listBox = $('#said-list-box'),//列表容器
                $nextBtn = $('#said-nextPage'),//下一页按钮
                $nextTxt = $nextBtn.find('span'),//下一页按钮的文案
                $saidLoading = $('#said-loading');//正在加载
            $nextBtn.on('click', function () {
                $saidLoading.show();
                $nextBtn.hide();
                currentPageIndex++;
                load(currentPageIndex, limit, requestUrl).done(function (data) {
                    if (data.total > 0) {
                        var htmls = [];
                        data.rows.forEach(function (item) {
                            htmls.push(_.format(htmlTemplates, {
                                url: actionBase + item.id + '.html',
                                base: imgBase,
                                img: item.img,
                                title: _.escapeHTML(item.title),
                                summary: item.summary,
                                songname: _.escapeHTML(item.songname),
                                artist: item.artist,
                                pv: item.pv,
                                date: _.dateToLocal(item.date, window.dateNow, 'yyyy-MM-dd')
                            }));
                        });
                        $listBox.append(htmls.join(''));
                        if (currentPageIndex >= maxPage) {
                            $nextBtn.parent().hide();//隐藏掉加载下一页的按钮
                        } else {
                            $nextBtn.show();
                            $nextTxt.html('点击加载更多');
                        }
                    } else {
                        $nextPage.show();
                        $nextTxt.html('加载失败，点击重新加载');
                    }
                }).fail(function () {
                    $nextBtn.show();
                    $nextPageText.html('加载失败，点击重新加载');
                }).always(function () {
                    $saidLoading.hide();
                })

            });
        });
    }
});