define('article', ['jquery', 'so'], function ($, so) {

    return function (musicFilePath, maxDuration, saidId) {
        //like按钮
        var $like = $('#said-like');

        var $player = $('#said-player'),//播放器
            playerElem = $player[0],//播放器DOM
            $playBtn = $('#said-player-play'),//播放
            $stopBtn = $('#said-player-stop'),//停止
            $progress = $('#said-progress'),//进度
            $duration = $('#player-duration'),//时间
            togglePlay = function (isPlay) {//切换显示播放按钮
                if (isPlay) {
                    $playBtn.hide();
                    $stopBtn.show();
                } else {
                    $playBtn.show();
                    $stopBtn.hide();
                }
            },
            updateProgress = function (currentTime) {
                $progress.css('width', currentTime / maxDuration * 100 + '%');
                $duration.html(so.parseTime(currentTime > maxDuration ? maxDuration : currentTime, 'mm:ss'));
            };

        //停止
        $stopBtn.on('click', function () {
            Umeng.event('said：' + saidId, '音乐停止', '用户点击了音乐停止', 1, 'palyer-stop');
            playerElem.pause();
            playerElem.currentTime = 0;
            updateProgress(0);
            togglePlay(false);
        });
        //播放
        $playBtn.on('click', function () {
            Umeng.event('said：' + saidId, '音乐播放', '用户点击了音乐播放', 0, 'play-btn');
            playerElem.play();
            togglePlay(false);
        });
        //timeupdate會在音樂播放時不斷生效，可透過此事件更新時間。
        $player.on('timeupdate', function (e) {
            //console.dir(this); //this.currentTime
            updateProgress(this.currentTime);
        });

        $player.on('play', function () {
            maxDuration = playerElem.duration > 0 ? parseInt(playerElem.duration) : maxDuration;
            togglePlay(true);
        });

        $player.on('ended', function () {

            togglePlay(false);
        });

        $player.attr('src', musicFilePath);

        var $readProgress = $('#said-readState'), $content = $('#said-content');

        //正文距离顶部的高度
        var contentTop = $content.offset().top,
            contextHeight = $content.height(),
            windowScrollTop, computeScrollTop, $window = $(window), windowHeight = $window.height() - 180;//-180是因为文章底部还有个footer，高度恰好180

        //最后绑定scroll
        $(window).scroll(function () {
            windowScrollTop = $window.scrollTop()
            computeScrollTop = windowScrollTop - contentTop;
            if (computeScrollTop > 0 && computeScrollTop < contextHeight) {
                computeScrollTop = Math.round(computeScrollTop / (contextHeight - windowHeight) * 100);
                $readProgress.css({ width: computeScrollTop + '%' });
            } else if (computeScrollTop < 0)
                $readProgress.width(0);
            else
                $readProgress.css({ width: '100%' });
        });
        //so.throttle(, 200)

        if (!$like.data('like')) {//用户没有like这篇文章
            var lockSubmit = false;
            $like.on('click', function () {
                if (lockSubmit) return;
                Umeng.event('said：' + saidId, '用户 Like Said', '用户 Like 了 Said - ' + saidId, 0, 'fa-heart');
                lockSubmit = true;
                $.ajax({
                    url: '/Said/LikeArticle',
                    type: "post",
                    dataType: "json",
                    data: { id: saidId } //注意对内容进行编码
                }).done(function (data) {
                    if (data.code === 0) {
                        $like.addClass('likeIt');
                        var $likeCount = $('#likeCount');
                        $likeCount.html(parseInt($likeCount.html()) + 1);
                    }

                }).fail(function () {
                    lockSubmit = false;
                });
            })
        }
    }

});