// blog 列表页，页面中会注入 window.category 用来判定是否有分类选项

$(() => {
  // 分类按钮
  const $cateBtn = $('#cate-btn')
  // 分类容器
  const $categorys = $('#categorys')
  // 分类内容真实高度
  const height = $categorys.find('.box').height()
  // 开关状态
  let open = false
  // 表示当前页面是根据类别查询得出，所以默认展开分类列表
  if ($categorys.data('open')) {
    open = true
    $categorys.height(height)
  }
  // 显示/隐藏分类内容
  $cateBtn.on('click', () => {
    if (open) {
      $cateBtn.removeClass('open')
      $categorys.height(0)
    } else {
      $cateBtn.addClass('open')
      $categorys.height(height)
    }
    open = !open
  })
})