import { get } from '../lib/ajax'
import { format } from '../lib/utils'

interface IViewArticle {
  _id: string,
  title: string,
  context: string,
  key: string,
  author: {
    nickName: string,
  },
  summary: string,
  poster: {
    _id: string,
    size: number,
    fileName: string,
    type: number,
    name: string,
    key: string,
    thumb: string,
  },
  song: {
    _id: string,
    key: string,
    title: string,
    mimeType: string,
    size: number,
    artist: string,
    album: string,
    duration: number,
    image: {
      _id: string,
      size: number,
      fileName: string,
      type: number,
      name: string,
      key: string,
    }
  },
  info: {
    localDate: string,
    likeCount: number,
    createTimeString: string,
    createTime: number,
    updateTime: number,
    pv: number,
  },
}



window.addEventListener('DOMContentLoaded', () => {
  /**
   * 文章列表容器
   */
  const $listBox = document.querySelector('#lists')
  /**
   * 加载更多按钮
   */
  const $more = document.querySelector('#load-more')

  /**
   * 没有对应的 dom
   */
  if (!$more) return
  /**
   * "点击加载更多" 按钮容器
   */
  const $a = $more.children[0] as HTMLLinkElement
  // 点击加载更多文本
  const $text = $a.querySelector('span')
  /**
   * "正在加载中" 按钮容器
   */
  const $span = $more.children[1] as HTMLSpanElement

  /**
   * 模板
   */
  const template = document.querySelector('#tmp-item').innerHTML


  /**
   * 最大页数
   */
  const maxPage = parseInt($more.getAttribute('data-max'))


  /**
   * 下一页页码
   */
  let nextPage = 2

  $a.addEventListener('click', () => {
    $a.style.display = 'none'
    $span.style.display = ''

    // 发送 ajax
    get({
      url: `/said/get/${nextPage}`,
      callback: (err, returns) => {
        if (err || (returns && returns.code !== 0)) {
          $text.innerHTML = '加载失败，点击重新加载'
          $a.style.display = ''
          $span.style.display = 'none'
          return
        }
        // 有下一页，可以继续加载
        if (nextPage < maxPage) {
          nextPage++
          $a.style.display = ''
        }
        $span.style.display = 'none'
        console.log(returns)
        if (returns && returns.data && returns.data.lists && returns.data.lists.length) {
          // 填充数据
          const html = returns.data.lists.map((article: IViewArticle) => {
            return format(template, {
              key: article.key,
              thumb: article.poster.thumb,
              title: article.title,
              songTitle: article.song.title,
              songArtist: article.song.artist,
              songAlbum: article.song.album,
              summary: article.summary,
              localDate: article.info.localDate,
              pv: article.info.pv,
            })
          }).join('')
          $listBox.insertAdjacentHTML('beforeend', html)
        }
      }
    })
  })
})