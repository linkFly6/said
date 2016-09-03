define('article', ['jquery', 'so'], function ($, so) {
    return function (saidId, playerSrc) {
        //like按钮
        var $like = $('#said-like');

        if (playerSrc) {
            var $player = $('#said-player'),//播放器
                playerElem = $player[0],
                isLoaded = false,//是否已经加载过资源文件
                $playBtn = $('#said-player-play'),//播放
                $stopBtn = $('#said-player-stop'),//停止
                togglePlay = function (isPlay) {//切换显示播放按钮
                    if (isPlay) {
                        $playBtn.hide();
                        $stopBtn.show();
                    } else {
                        $playBtn.show();
                        $stopBtn.hide();
                    }
                };
            //停止
            $stopBtn.on('click', function () {
                playerElem.pause();
                playerElem.currentTime = 0;
                togglePlay(false);
            });
            //播放
            $playBtn.on('click', function () {
                if (!isLoaded) {
                    playerElem.src = playerSrc;
                    isLoaded = true;
                }
                playerElem.play();
                togglePlay(true);
            });
            //允许播放
            $player.on('play', function () {
                togglePlay(true);
            });
            //播放结束
            $player.on('ended', function () {
                togglePlay(false);
            });
        }

        if (!$like.data('like')) {//用户没有like这篇文章
            var lockSubmit = false;
            $like.on('click', function () {
                if (lockSubmit) return;
                lockSubmit = true;
                $.ajax({
                    url: playerSrc ? '/said/LikeArticle' : '/blog/LikeArticle',
                    type: "post",
                    dataType: "json",
                    data: { id: saidId } //注意对内容进行编码
                }).done(function (data) {
                    if (data.code === 0) {
                        $like.addClass('likeIt');
                        var $likeCount = $('#likeCount');
                        $likeCount.html(parseInt($likeCount.html()) + 1);
                        $like.find('i').removeClass('fa-heart-o').addClass('fa-heart');
                    }

                }).fail(function () {
                    lockSubmit = false;
                });
            })
        }
    }

});