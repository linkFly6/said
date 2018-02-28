import { Player } from './lib/player'
import { parseTime } from './lib/format'
import { initUserLikeEvent } from './lib/user-like'

$(() => {
  // 播放器容器 DOM
  const $player = $('#player')
  // 播放器播放/暂停按钮
  const $button = $player.find('.palyer-button')
  // 播放器播放/暂停按钮 button 的 icon
  const $buttonIcon = $button.find('.saidfont')
  //  播放进度
  const $playerVolume = $player.find('.player-volume')
  // 当前播放时间
  const $curTime = $player.find('.cur-time')

  // 歌曲 src
  const musicSrc = $player.data('src')

  const player = new Player({ autoplay: true, loop: true })

  player.onTimer((progress, currentTime) => {
    $playerVolume.css('width', progress + '%')
    $curTime.text(parseTime(currentTime))
  })

  player.on('play', () => {
    $buttonIcon.removeClass('icon-play_icon').addClass('icon-stop_icon')
  })

  player.onEnded(() => {
    $buttonIcon.removeClass('icon-stop_icon').addClass('icon-play_icon')
  })

  player.play(musicSrc)

  let isPlay = true
  $button.on('click', () => {
    // @TODO umeng 统计
    if (isPlay) {
      player.stop()
      $buttonIcon.removeClass('icon-stop_icon').addClass('icon-play_icon')
    } else {
      player.play()
    }
    isPlay = !isPlay
  })

  // 用户 like
  initUserLikeEvent(
    '/said/like',
    { articleId: (window as any).articleId },
    (err, data) => {
      // @TODO umeng 统计
      console.log(err, data)
    })
})