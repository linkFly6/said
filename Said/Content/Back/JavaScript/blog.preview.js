define('blog.preview', ['jquery', 'so'], function ($, _) {
    return function () {
        $(function () {
            //滚动菜单
            var $nav = $('#a-nav'),
                $navBg = $nav.find('.nav-bg'),//导航背景（偏移到当前项的）
                $navList = $nav.find('.anb-box'),//导航内容容器
                navItemHeight = 28,//或者单位换成2em
                $main = $('#blog-main'),
                mainTop = $main.offset().top,
                windowHeight = window.innerHeight,
                $titles = $('.html h2,.html h3'),
                //titleLastIndex = $titles.length,
                titleTops = [],//[{ value: 1024, child: [{value:1025, title:'' }, 1026], title:'' }]
                lastTitle,//最后一个title
                navHTMLs = [],
                _currCount = 0;


            $titles.each(function (i) {
                var $title = $(this),
                    top = parseInt($title.offset().top - $title.height()),//title距离顶部的距离
                    titleHtml = $title.html(),
                    tagName = $title.prop('tagName');//H2,H3
                if (tagName === 'H3') {//h3
                    if (lastTitle == null) return;//如果前几个标签是h3（所以lastTitle为null），则忽略
                    lastTitle.child.push({ value: top, title: titleHtml, prevCount: _currCount });
                } else {//h2
                    titleTops.push({ value: top, child: [], title: titleHtml, prevCount: _currCount });
                    lastTitle = titleTops[titleTops.length - 1];
                }
                _currCount++;
            });

            var _currIndex = 0;
            _.each(titleTops, function (item, i) {
                navHTMLs.push('<li><a href="javascript:;" class="_nav-i" data-top="', item.value, '" data-i="', _currIndex, '">', item.title, '</a>');
                if (item.child.length) {
                    navHTMLs.push('<ul>');
                    _.each(item.child, function (childItem, j) {
                        _currIndex++;
                        navHTMLs.push('<li><a href="javascript:;" class="_nav-i" data-top="', childItem.value, '" data-i="', _currIndex, '">', childItem.title, '</a></li>');
                    });
                    navHTMLs.push('</ul>');
                }
                _currIndex++;
                navHTMLs.push('</li>');
            });

            var titleIndexValues = [],
                //[ { value, height } ]
                _lastNavTop = 0,
                $body = $(document.body);
            $navList.html(navHTMLs.join('')).find('>li>a').each(function () {
                var $this = $(this),
                    height = $this.height(),
                    top = $this.data('top');
                titleIndexValues.push({ value: _lastNavTop, height: height });
                _lastNavTop += height;
                $this.on('click', function () {
                    $body.stop().animate({ scrollTop: top }, 300);
                });
                if ($this.next().length > 0) {
                    var lastValue = titleIndexValues[titleIndexValues.length - 1];
                    lastValue.child = [];
                    $this.next().find('>li>a').each(function () {
                        var $this = $(this),
                            top = $this.data('top'),
                            height = $this.height();
                        lastValue.child.push({ value: _lastNavTop, height: height });
                        _lastNavTop += height;
                        $this.on('click', function () {
                            $body.stop().animate({ scrollTop: top }, 300);
                        });
                    });
                }
            });


            var titleTopLastIndex = titleTops.length - 1,
                navBgIsHide = true,
                navIndexToTop = function (i, j) {
                    if (i == -1) {
                        $navBg.hide();
                        navBgIsHide = true;
                        return;
                    } else if (navBgIsHide) {
                        $navBg.show();
                    }
                    var tmp = titleIndexValues[i];
                    if (j != null && tmp.child) {
                        $navBg.css('top', tmp.child[j].value).height(tmp.child[j].height);
                    } else {
                        $navBg.css('top', tmp.value).height(tmp.height);
                    }

                };



            var titleScroll = _.throttle(function (scrollValue) {
                //倒序循环，取最大的值
                var i = titleTopLastIndex,
                    item;
                for (; i >= 0; i--) {
                    item = titleTops[i];
                    //当前滚动条的value大于等于当前取到的top，证明滚动条已经在这个title范围内
                    if (scrollValue >= item.value) {
                        if (item.child.length) {//如果有h3
                            //再倒序循环一遍
                            var itemLastIndex = item.child.length - 1, j = itemLastIndex, childItem;
                            for (; j >= 0; j--) {
                                childItem = item.child[j];
                                if (scrollValue >= childItem.value) {
                                    navIndexToTop(i, j);
                                    break;
                                } else if (j == 0) {
                                    navIndexToTop(i);
                                }
                            }
                        } else {
                            navIndexToTop(i);
                        }
                        break;
                    } else if (i == 0) {//i==0，并且没有进入第一个条件，也就是说第一个h2距离和h1(文章标题)有一段距离
                        navIndexToTop(-1);
                    }
                }
            }, 200);//进行函数节流

            $(window).on('scroll', function () {
                if (window.scrollY > mainTop) {
                    $nav.addClass('fixed');
                } else
                    $nav.removeClass('fixed');
                titleScroll(window.scrollY);
            }).trigger('scroll');
        });
    }
});