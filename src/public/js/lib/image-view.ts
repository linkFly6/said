/**
 * 查看大图
 */

export const view = (img: HTMLImageElement, className?: string) => {
  let newImg = img.cloneNode()
  let width = img.width
  let height = img.height
  let $mask = $(`<div ${className}><div class="bg"></div></div>`)
  $mask.append(newImg as Element)
  // @TODO 获取相对视角的位置
  $(document.body).append($mask)
}