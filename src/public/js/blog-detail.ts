import { format, throttle } from './lib/utils'
import { view } from './lib/image-view'
// ts 按需加载会报错（因为 @types 没有声明命名空间），所以只能通过 require 来实现按需加载了
const once = require('lodash/once')

/**
 * blog 详情页 js
 */
$(() => {
  const $document = $(document.documentElement)
  // 右侧文章目录
  const $nav = $('#blog-nav')

  // 文章目录
  const $navList = $nav.find('.context')
  // 文章内容容器
  const $context = $('#article-context')
  // 文章正文容器
  const $HTML = $context.find('.html')
  // 目录从 h2/h3 取，忽略其他标签
  const $titles = $HTML.find('h2, h3')
  // 参见 blog-detail.pug => <li><a data-top='${top}'>${text}</a>${child}</li>
  const templateNavItem = $('#tmp-nav-item').html()

  // 存放 title 对应的距离顶部高度、文本、子目录信息
  const titles: Title[] = []
  // 最后一个 title，因为 h2 后面会跟着 h3，而查询出来是平级的
  let lastTitle: Title | null = null

  // 获取文章中的标题，生成对应的数据对象
  $titles.each((i, element) => {
    const $title = $(element)
    // title距离顶部的距离
    const top = $title.offset().top - $title.height()

    // title 文本
    const text = $title.children().last().text()

    if ($title.prop('tagName') === 'H3') { // H2/H3
      // 如果（页面刚开始）前几个标签是h3（所以lastTitle为null），则忽略，因为会导致显示样式异常
      if (lastTitle === null) return
      // height 暂时是 0，会在生成 DOM 之后填充上高度
      lastTitle.child.push({ top, text, height: 0, navTop: 0 })
    } else {
      // h2
      titles.push({ top, text, child: [], height: 0, navTop: 0 })
      lastTitle = titles[titles.length - 1]
    }

  })

  // 导航菜单 HTML 拼接数组
  const navHTMLs: string[] = ['<ul>']
  // 根据导航菜单生成目录
  titles.forEach((title, i) => {
    let childHTMLs: string[] = []
    // 有子元素
    if (title.child.length) {
      childHTMLs.push('<ul>')
      // 拼接子菜单的 HTML
      childHTMLs.push(title.child.map(child => {
        return format<TemplateNavItem>(templateNavItem, {
          top: child.top,
          text: child.text,
          child: '',
        })
      }).join(''))
      childHTMLs.push('</ul>')
    }
    navHTMLs.push(format<TemplateNavItem>(templateNavItem, {
      top: title.top,
      text: title.text,
      child: childHTMLs.join('')
    }))
  })
  navHTMLs.push('</ul>')

  // 目录小标题距离目录容器顶部的距离
  let navTop = 0
  // 生成 DOM 并绑定事件
  $navList.html(navHTMLs.join('')).find('>ul>li>a').each((i, element) => {
    const $title = $(element)
    const top = $title.data('top')
    // 填充上数据高度
    let height = $title.height()
    titles[i].height = height
    titles[i].navTop = navTop
    // 累加目录小标题距离目录容器顶部的高度
    navTop += height
    // 1级目录
    $title.on('click', () => {
      // @TODO ument 统计
      // chrome 61 之后 body.scrollTop 已经失效
      $document.stop().animate({ scrollTop: top }, 300)
    })

    // 2级目录
    if ($title.next().length > 0) {
      $title.next().find('li>a').each((j, element) => {
        const $child = $(element)
        const childTop = $child.data('top')
        titles[i].child[j].height = $child.height()
        titles[i].child[j].navTop = navTop
        navTop += height
        $child.on('click', () => {
          // @TODO ument 统计
          $document.stop().animate({ scrollTop: childTop }, 300)
        })
      })
    }
  })

  // 处理滚动条对应的事件

  // 文章目录当前激活项的背景
  const $navLine = $nav.find('.line')
  /**
   * 当前滚动条滚动的进度和对应小菜单的背景(激活逻辑)
   * @param i 
   * @param j 
   */
  const scrollNavLine = (i: number, j?: number) => {
    // 隐藏菜单激活
    if (i === -1) {
      $navLine.hide()
      return
    } else {
      $navLine.show()
    }
    const title = titles[i]
    if (j != null && title.child.length) {
      // 子目录
      $navLine.css('top', title.child[j].navTop).height(title.child[j].height)
    } else {
      $navLine.css('top', title.navTop).height(title.height)
    }
  }

  let titlesLastIndex = titles.length - 1

  /**
   * 根据滚动值处理导航如何显示
   */
  const titleScroll = throttle<(v: number) => void>((scrollValue: number) => {
    let i = titlesLastIndex
    for (; i >= 0; i--) {
      const title = titles[i]
      // 当前滚动条的 value 大于等于当前取到的 top，证明滚动条已经在这个 title 范围内
      if (scrollValue >= title.top) {
        // 有子目录
        if (title.child.length) {
          // 再倒序循环一遍子目录数据
          let j = title.child.length - 1
          for (; j >= 0; j--) {
            const child = title.child[j]
            if (scrollValue >= child.top) {
              scrollNavLine(i, j)
              break
            } else if (j === 0) {
              scrollNavLine(i)
            }
          }
        } else {
          scrollNavLine(i)
        }
        break
      } else if (i === 0) {
        // 已经循环到最后一圈了都没有 break 出来，证明当前滚动条不在正文范围内
        scrollNavLine(-1)
      }
    }
  }, 200)

  // 针对所有的图片
  let imgs = $HTML.find('img')

  // 加载图片
  let promises = Array.prototype.map.call(imgs, (img: HTMLImageElement) => {
    return new Promise(resolve => {
      let onloaded = false
      let done = once(() => {
        resolve()
        onloaded = true
      })
      if (img.complete) {
        done()
      }
      img.addEventListener('load', done)
      img.addEventListener('error', done)
      img.addEventListener('abort', done)
      img.addEventListener('click', () => {
        if (!onloaded) return
        // 样式在 lib/article.styl 中
        view(img, {
          className: 'app-image-view',
        })
      })
    })
  }) as Promise<any>[]

  // 图片加载完成后在绑定计算滚动条
  Promise.all(promises)
    .then(() => {
      // 正文距离页面顶部的高度
      const mainTop = $context.offset().top
      // 文章正文底部
      const maxScroll = $HTML.offset().top + $HTML.height() - $nav.height()
      const navOffsetTop = $nav.offset().top
      // 导航的父容器
      const $navParentBox = $nav.parent()
      $(window).on('scroll', function () {
        if (window.scrollY >= maxScroll) {
          // 滚动条到文章底部了之后，将右侧菜单固定住
          $nav.removeClass('fixed')
          $navParentBox.css('top', maxScroll - navOffsetTop)
        } else if (window.scrollY > mainTop) {
          $nav.addClass('fixed')
          $navParentBox.css('top', 0)
        } else {
          $nav.removeClass('fixed')
          $navParentBox.css('top', 0)
        }
        titleScroll(window.scrollY)
      }).trigger('scroll')
    })
})

// 目录数据对象
type Title = {
  // 文章二级标题距离页面顶部的距离
  top: number,
  // 文章二级标题
  text: string,
  // 文章二级标题的目录高度
  height: number,
  // 文章二级标题的目录距离目录容器顶部的距离 
  navTop: number,
  // 文章三级标题
  child: Array<{ top: number, text: string, height: number, navTop: number }>
}

// 目录 HTML 模板 format 使用的格式
type TemplateNavItem = { top: number, text: string, child: string }



