window.addEventListener('DOMContentLoaded', () => {
  const $html = document.documentElement
  // 右上角导航按钮
  const $elemNavigationButton = document.getElementById('nav-btn')

  // 页面容器
  const $elemPage = document.getElementById('page')

  // 页面蒙版
  const $elemNavigationMask = document.getElementById('nav-mask')
  const regOpenNavigation = /open/
  
  $elemNavigationButton.addEventListener('click', () => {
    const clName = $elemPage.className
    if (regOpenNavigation.test(clName)) {
      // 关闭导航菜单显示
      $elemPage.className = clName.replace(regOpenNavigation, '').trim()
      setTimeout(() => {
        // 先改变 class 触发动画，6s (动画执行完成后) 再隐藏掉模板容器
        $elemNavigationMask.style.display = 'none'
        $html.className = $html.className.replace('lock', '').trim()
      }, 600)
    } else {
      // 显示导航菜单

      // 先让导航菜单的模板显示
      $elemNavigationMask.style.display = ''
      // 再添加 class，否则不会触发动画
      setTimeout(() => {
        // 推到 macrotask 中
        $elemPage.className = clName + ' open'
        $html.className += ' lock'
      })
    }
  })
})