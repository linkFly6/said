import { Player } from '../lib/player'
import { addClass, removeClass } from '../lib/utils'
import { ajax } from '../lib/ajax'
import { initMobileUserLikeEvent } from '../lib/user-like'


window.addEventListener('DOMContentLoaded', () => {
  // 播放/暂停按钮
  const $play = document.querySelector('#play') as HTMLLinkElement
  // 播放/暂停 icon
  const $ico = $play.querySelector('i')

  // 播放 url
  const musicSrc = $play.getAttribute('data-src')

  // 播放器
  const player = new Player()

  // 是否正在播放
  let isPlay = false


  player.onEnded(() => {
    // 播放结束
    removeClass($ico, 'icon-tingzhi')
    addClass($ico, 'icon-bofang')
    isPlay = false
  })

  $play.addEventListener('click', () => {
    if (isPlay) {
      // 停止播放
      removeClass($ico, 'icon-tingzhi')
      addClass($ico, 'icon-bofang')
      player.stop()
    } else {
      // 开始播放
      removeClass($ico, 'icon-bofang')
      addClass($ico, 'icon-tingzhi')
      // 播放的时候才设置 url，节省流量
      player.play(musicSrc)
    }
    isPlay = !isPlay
  })

  // 用户 like
  initMobileUserLikeEvent(
    '/said/like',
    { articleId: (window as any).articleId },
    (err, data, element) => {
      // window.Umeng.event('article', 'like', '用户点赞', (window as any).articleId, element.id)
    })
})

