define('blog.index', ['jquery', 'so'], function ($, _) {
    /*
    <a class="said-item" href="/blog/20160815035421.html">
                    <div class="item-context">
                        <div class="item-article">
                            <h2>原型对象的constructor</h2>
                            <div class="article-txt line-clamp line2"><p>因为`constructor`是不安全属性，它是允许被重写的，所以题主追问的判定代码并不正确。</p><p></p><p>另外`constructor`在对象的实现上是在构造函数里传递指向的，具体的实现可以参阅《[ECMA-262标准实现规范 —— createdynamicfunction()][1]》。</p><p></p><p>也即是说，是先运行构造函数，后指向`constructor`的（在构造函数里指向`constructor`）。</p></div>
                            <div class="item-more">
                                <span class="cate">VS</span>
                                <span class="fa fa-eye like" title="like"><i class="globalFont">4</i></span>
                                <time class="fa fa-calendar-o time"><i class="globalFont">2016-08-15</i></time>
                            </div>
                        </div>
                    </div>
                </a>
    */
    var htmlTemplates = '<a class="said-item" href="/blog/${url}.html"><div class="item-context"><div class="item-article"><h2>${title}</h2><div class="article-txt line-clamp line2">${summary}</div><div class="item-more"><span class="cate">${classify}</span><span class="fa fa-eye"><i class="globalFont">${pv}</i></span>&nbsp;<time class="fa fa-calendar-o time"><i class="globalFont">${date}</i></time></div></div></div></a>';
    var load = function (currrPageIndex, limit, requestUrl) {
        return $.ajax({
            url: requestUrl,
            type: "get",
            dataType: "json",
            data: { limit: limit, offset: parseInt((currentPageIndex - 1) * limit) }
        });
    },
    currentPageIndex = 1;

    return function (maxPage, limit, requestUrl, actionBase) {
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
                                title: _.escapeHTML(item.title),
                                summary: item.summary,
                                classify: item.cname,
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