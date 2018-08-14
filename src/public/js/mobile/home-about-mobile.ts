/**
 * 获取一个元素距离页面顶部的的位置
 * @param elem 
 */
const getOffsetTop = (elem: Element) => {
  // window + getBoundingClientRect().top
  return elem.ownerDocument.defaultView.pageYOffset + elem.getBoundingClientRect().top
}



window.addEventListener('DOMContentLoaded', () => {
  const $one = document.querySelector('.section-one')
  const val = getOffsetTop($one)
  const compute = () => {
    const scrollY = window.scrollY
    if (val >= scrollY) {
      $one.classList.add('view-show')
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