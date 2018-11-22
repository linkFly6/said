// require('es6-promise').polyfill()
/**
 * 注意 main.ts 是访问不到 umeng 的，因为这时候还没注入 umeng
 */
$(() => {
  // 导航滑动
  // 导航容器
  const $navs = $('#nav')
  // 404 或者 500 页面没有导航
  if ($navs.length) {
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
  }
  // 这里的 window 没有报错是因为 tsconfig.json 中指定了 files
  // 友盟统计
  const czc = window._czc = window._czc || []
  czc.push(['_setAccount', '1260021113'])
  window.Umeng = {
    // 发送友盟统计事件
    event: function (category: string, action: string, label: string, value: number, classId: any) {
      window._czc.push(['_trackEvent', category, action, label, value, classId])
    }
  }

  /**
   * 捕获全局错误
   */
  window.addEventListener('error', function (e) {
    window.Umeng.event('Exception', '全局异常', JSON.stringify({
      path: e.filename, // 错误文件
      msg: e.message, // 错误信息
      lineno: e.lineno, // 错误行
      colno: e.colno // 错误列
    }), 2, '')
  })
})