import { addClass } from '../lib/utils'
/**
 * 获取一个元素在页面中的位置
 * top: 顶部距离页面顶部的位置
 * bottom: 底部距离页面顶部的位置
 * @param elem 
 */
const getViewPosition = (elem: HTMLElement) => {
  const domRect = elem.getBoundingClientRect()
  const pageYOffset = elem.ownerDocument.defaultView.pageYOffset
  // 半个屏幕的高度
  // const halfScreenHeight = elem.ownerDocument.defaultView.innerHeight / 2
  const screenHeight = window.innerHeight
  return {
    /**
     * 元素距离页面顶部的距离 - 半个屏幕的距离
     */
    top: Math.max((pageYOffset + domRect.top) - screenHeight * 0.7, 0),
    /**
     * 【元素的底部】距离页面顶部的距离 + 半个屏幕的距离
     */
    bottom: (pageYOffset + domRect.bottom) - screenHeight / 3
  }
}

/**
 * 计算页面中需要设定滚动动画的元素位置并范围
 */
const computeElementPosition = () => {
  // 页面元素
  const $animationElements = document.querySelectorAll('.section-animation')
  // 经过计算后的页面元素，元素对应的位置，元素是否已经追加过 class 动画
  const animationArrs: Array<{ top: number, bottom: number, elem: HTMLElement, added: boolean }> = []
  for (let index = 0; index < $animationElements.length; index++) {
    const element = $animationElements[index] as HTMLElement
    const position = getViewPosition(element)
    // 逐渐从前面插入，这样循环的时候会从最大循环往前循环
    animationArrs.push({
      top: position.top,
      bottom: position.bottom,
      elem: element,
      added: false,
    })
  }
  return animationArrs
}


window.addEventListener('DOMContentLoaded', () => {
  const animationArrs = computeElementPosition()
  const compute = () => {
    const scrollY = window.scrollY
    for (let index = 0; index < animationArrs.length; index++) {
      const position = animationArrs[index]
      if (scrollY >= position.top && scrollY <= position.bottom && !position.added) {
        // 标记已经执行过动画
        position.added = true
        addClass(position.elem, 'view-show')
      }
    }
  }
  window.addEventListener('scroll', () => {
    compute()
  })
  compute()
})

const animationend = (e: Event) => {
  // 为了防止动画之后的 animation-fill-mode:forwards 属性失效，所以给动画都加上 class
  const className = (e.target as any).dataset.animationEnd
  if (className)
    (e.target as any).classList.add(className)
}

/**
 * 监听全局动画事件冒泡，如果设置了 data-animation-end 属性
 * 则在动画结束的时候给对应的元素加上 className
 */
document.body.addEventListener('animationend', animationend)
document.body.addEventListener('transitionend', animationend)