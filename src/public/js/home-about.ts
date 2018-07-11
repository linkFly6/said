const skrollr = require('skrollr')

skrollr.init({
  // 默认会有缓动动画，设置 smoothScrolling 为 false 可以禁用缓动动画
  // smoothScrolling: false,
  /**
   * @param element - 滚动的元素
   * @param name - 滚动触发时机（dataTop）
   * @param direction - 方向（up/down）
   */
  keyframe: function (element: Element, name: string, direction: 'up' | 'down') {
    /**
     * 类似于一个插件，用来解析 data-class 和 data-forward
     * data-class，到达命中的位置(例如 data-top) 就追加的 className
     * data-forwards 当滚动条向上滚出区域的时候，是否移除这个动画（也就是动画是否随着滚动条重复播放）
     */
    if (element.getAttribute('data-class')) {
      const $element = $(element)
      // 向下滑动
      if (direction === 'down') {
        // 根据 data-class 追加
        $element.addClass($element.data('class'))
      } else {
        // 向上滑动
        if ($element.data('forwards') == null) {
          // 当 data-forwards 不为空的时候不会移除 class(也就是让动画保持)
          $element.removeClass($element.data('class'))
        }
      }
    }
  }
})

/**
 * 监听全局动画事件冒泡，如果设置了 data-animation-end 属性
 * 则在动画结束的时候给对应的元素加上 className
 */
$(document.body).on('animationend transitionend', e => {
  // 为了防止动画之后的 animation-fill-mode:forwards 属性失效，所以给动画都加上 class
  const $element = $(e.target)
  const className = $element.data('animationEnd')
  $element.addClass(className)
})
