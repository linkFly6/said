// const skrollr = require('skrollr')
const ScrollMagic = require('scrollmagic')
// webpack alias
require('scrollmagic.animation.gsap')
import Typed from 'typed.js'
$(() => {
  // skrollr.init({
  //   // 默认会有缓动动画，设置 smoothScrolling 为 false 可以禁用缓动动画
  //   // smoothScrolling: false,
  //   /**
  //    * @param element - 滚动的元素
  //    * @param name - 滚动触发时机（dataTop）
  //    * @param direction - 方向（up/down）
  //    */
  //   keyframe: function (element: Element, name: string, direction: 'up' | 'down') {
  //     /**
  //      * 类似于一个插件，用来解析 data-class 和 data-forward
  //      * data-class，到达命中的位置(例如 data-top) 就追加的 className
  //      * data-forwards 当滚动条向上滚出区域的时候，是否移除这个动画（也就是动画是否随着滚动条重复播放）
  //      */
  //     if (element.getAttribute('data-class')) {
  //       const $element = $(element)
  //       // 向下滑动
  //       if (direction === 'down') {
  //         // 根据 data-class 追加
  //         $element.addClass($element.data('class'))
  //       } else {
  //         // 向上滑动
  //         if ($element.data('forwards') == null) {
  //           // 当 data-forwards 不为空的时候不会移除 class(也就是让动画保持)
  //           $element.removeClass($element.data('class'))
  //         }
  //       }
  //     }
  //   }
  // })


  const controller = new ScrollMagic.Controller({
    // loglevel: 3, // debug
  })

  bgOneAmination(controller)
  bgTwoAmination(controller)
  bgThreeAmination(controller)

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


  /**
   * typed.js 打字动画
   * @inheritDoc https://blog.csdn.net/weixin_41000111/article/details/78725784
   */
  const typed = new Typed('#typewrite', {
    strings: [
      '<span class="linkfly">@linkFly</span>',
      '<span class="ts">TypeScript</span>',
      '<span class="js">JavaScript</span>',
      '<span class="nodejs">NodeJs</span>',
      '<span class="react">React</span>',
      '<span class="vue">Vue</span>',
      '<span class="electron">electron</span>'
    ],
    // 打字速度
    typeSpeed: 100,
    // 回退速度
    backSpeed: 100,
    // 回退延迟
    backDelay: 1500,
    // 开始前的延迟
    startDelay: 0,
    // 是否循环
    loop: true,
    // 无限循环
    loopCount: Infinity,
    // 是否是 HTML
    contentType: 'html',
  })

  // 默认暂停
  typed.stop()

  // 打字动画的 DOM
  const $elemTypeWrite = $('#typed-fade')
  // 当打字动画的 DOM 显示完毕后才开始显示打字
  $elemTypeWrite.on('animationend transitionend', () => {
    typed.start()
  })
})


/**
 * 第一张大图的动画，大概包含 3 部分动画
 * 1. 图片背景 blur
 * 2. 默认显示第一段文字
 * 3. 随着滚动进度，第一段文字隐藏，逐渐显示第二段文字
 * @param controller 
 */
function bgOneAmination(controller: any) {
  /**
   * 创建场景
   * 场景：顶部大图的固定
   * @link http://scrollmagic.io/docs/ScrollMagic.Scene.html#constructor
   */
  new ScrollMagic.Scene({
    // 场景背景元素(可以理解为这个元素基于这个 DOM 内进行动画)
    triggerElement: '.content-one',
    // 基于 triggerElement 的触发角度（1：最底部，0.5：中间（默认值），0：最顶部）
    triggerHook: 0,
    // 场景持续量(就是偏移量)
    duration: 1000,    // the scene should last for a scroll distance of 100px
    // offset: 0        // start this scene after scrolling for 50px
  })
    // 到达 .content-one 就固定住
    .setPin('.bg-one')
    // 追加到页面控制器中
    .addTo(controller)

  /**
   * 场景：顶部大图里面的文本
   */
  new ScrollMagic.Scene({
    // 基于页面 300px
    duration: 600,
  })
    .setTween('.item-1', { opacity: 0 })
    // 追加到页面控制器中
    .addTo(controller)

  /**
   * 场景：顶部大图里面的背景图片 blur 效果
   */
  new ScrollMagic.Scene({
    duration: 600,
  })
    .setTween('.bg-one .bg', { filter: 'blur(6px)' })
    // 追加到页面控制器中
    .addTo(controller)

  /**
   * 场景：顶部大图里的第二段文字显示
   */
  new ScrollMagic.Scene({
    offset: 600,
    duration: 900,
  })
    .setTween('.item-2', { opacity: 1, display: 'block' })
    .addTo(controller)
}


/**
 * 第二部分关于听说
 * 1. 滚动到对应节点显示动画
 * 2. 图片背景逐渐灰度
 * 3. 文字跟随容器滚动
 * @param controller 
 */
function bgTwoAmination(controller: any) {
  // 元素在页面中动画显示
  new ScrollMagic.Scene({
    triggerElement: '.content-two',
    // triggerHook: 0,
  })
    .on('start', e => {
      if (e.scrollDirection === 'FORWARD') {
        $('.content-two').addClass('view-show')
      }
    })
    .addTo(controller)

  // 文字跟随容器滚动
  new ScrollMagic.Scene({
    triggerElement: '#two-content',
    triggerHook: 0,
    // 场景持续量(就是偏移量)
    duration: 716,
  })
    //文字跟随图片滚动
    .setPin('.content-two .text-des')
    // 图片逐渐灰度
    .setTween('.bg-coldplay', { filter: 'grayscale(100%)' })
    // 追加到页面控制器中
    .addTo(controller)
}


/**
 * 第三部分关于技术
 * 1. 滚动到对应节点显示动画
 * 2. 图片背景逐渐灰度
 * 3. 文字跟随容器滚动
 * @param controller 
 */
function bgThreeAmination(controller: any) {
  // 元素在页面中动画显示
  new ScrollMagic.Scene({
    triggerElement: '.content-three',
    // triggerHook: 0,
  })
    .on('start', e => {
      if (e.scrollDirection === 'FORWARD') {
        $('.content-three .section-content').addClass('view-show')
        $('.content-three .projects').addClass('view-show')
      }
    })
    .addTo(controller)

}