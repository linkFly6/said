// require('es6-promise').polyfill()
$(() => {
  // 导航滑动
  // 导航容器
  const $navs = $('#nav')
  // 当前激活的导航距离父容器的 left
  const activeLeft = $navs.find('.nav-active').position().left || 0
  // 导航下面的那条线
  const $line = $navs.find('#nav-line')

  // 循环导航项，绑定对应的鼠标事件
  $navs.find('li').each((i, element) => {
    const $nav = $(element)
    // 获取每个导航项距离父容器左侧的值
    let left = $nav.position().left

    $nav.on('mouseenter', function () {
      // 鼠标滑入，下面的线移动过去
      $line.css('left', left)
    }).on('mouseleave', function () {
      // 鼠标滑出，下面的线回到当前激活导航的位置
      $line.css('left', activeLeft)
    })
  })
})