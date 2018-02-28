/**
 * 查看大图
 */

let $doc = $(document.documentElement)

/**
 * 查看大图
 * @param img - 原图
 * @param {Object} options - 配置项
 * @param {string} options.className - 查看大图的容器 class
 */
export const view = (img: HTMLImageElement, options: {
  className?: string,
} = {}) => {
  // 先把滚动条 lock 住，不让滚动条锁定
  $doc.addClass('lock')
  let newImg = img.cloneNode() as HTMLImageElement
  let $newImg = $(newImg)

  newImg.title = '右键菜单可以打开原图'

  // 获取元素相对于浏览器窗口可视区域的位置
  let position = img.getBoundingClientRect()

  // 页面显示的图片宽高，因为 img 已经被渲染过了
  let pageShowWidth = img.width
  let pageShowHeight = img.height

  // 获取原图宽高，不能从 img 中获取，因为 img 已经被渲染过
  let sourceImageWidth = newImg.width
  let sourceImageHeight = newImg.height

  // 查看大图的容器
  let $content = $(
    `<div class="${options.className || ''}"><div class="bg" style="display:none"></div></div>`
  )

  let close = () => {
    $newImg.animate({
      top: position.top,
      left: position.left,
      width: pageShowWidth,
      height: pageShowHeight,
    }, 200, () => {
      // 直接移除 DOM
      $content.remove()
      $doc.removeClass('lock')
    })
  }
  // 点击容器，则关闭查看大图效果
  $content.on('click', () => {
    /**
     * 如果图片很高，会产生滚动条
     * 当有滚动条并且滚动条滚动了距离时，先把滚动条复位，同时修正图片定位到滚动条滚动的距离
     * 再执行关闭动画，这样看起来动画效果会非常顺畅（不会突兀的跳一下）
     */
    let contentScrollTopValue = $content.scrollTop()
    if (contentScrollTopValue > 0) {
      $content.scrollTop(0)
      $newImg.css('top', -contentScrollTopValue)
    }
    close()
  })

  // 背景蒙版
  let $mask = $content.find('.bg')

  $newImg
    .css({
      // 让新图片在页面中显示的宽高和旧图片一样
      width: pageShowWidth,
      height: pageShowHeight,
      // 把新的图片放在和原图一样的位置（遮盖住）
      top: position.top,
      left: position.left
    })


  // 添加到页面中
  $content.append(newImg as Element)
  $(document.body).append($content)

  // 计算图片如何显示放大的图片

  const screenHeight = window.innerHeight
  const screenWidth = window.innerWidth


  // 检查图片长宽比是否溢出屏幕，如果溢出屏幕则进行修正


  /**
   * 主要逻辑是按照宽图来修正宽度，长图的话不用管，因为可以直接下拉滚动条来看
   */
  if (sourceImageWidth > screenWidth) { // 很宽的图，收缩宽度
    let ratio = sourceImageHeight / sourceImageWidth
    sourceImageWidth = screenWidth
    sourceImageHeight = sourceImageWidth * ratio
  }
  // 如果图片很高，就不处理了，因为可以自己用滚动条滑动来看

  // 计算移动到屏幕中心所需的位置，如果图片很长会出现负值，抹平负值
  let targetTop = Math.max(screenHeight - sourceImageHeight, 0) / 2
  let targetLeft = Math.max(screenWidth - sourceImageWidth, 0) / 2

  // ready

  // 动画渐进蒙版，点击蒙版会关闭查看大图
  $mask.fadeIn(200)
  // 滑动显示大图
  $newImg.animate({
    height: sourceImageHeight,
    width: sourceImageWidth,
    top: targetTop,
    left: targetLeft
  }, 200)
}