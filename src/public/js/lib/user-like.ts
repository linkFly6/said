import { ajax } from './ajax'

/**
 * [PC端]通用用户 like 事件，需要在 DOM Ready 之后调用
 * 移动端方法请参见 initMobileUserLikeEvent
 * @param url like 请求的 url
 * @param params 请求参数
 * @param callback 完成后的回调函数，第一个参数是错误（xhr），第二个参数是服务器返回
 */
export const initUserLikeEvent = (
  url: string,
  params: object,
  callback: (err: any, data: { code: number, message: string, data: any } | null, element: HTMLElement) => void
) => {
  const $userLike = $('#user-like')
  const $likeText = $userLike.children().eq(0)
  const $likeSum = $userLike.children().eq(1)

  // 注意，这里是 a 标签，理论上是不应该有 disabled 标签的
  if (!$userLike.attr('disabled')) { // 用户没有 like 这篇文章
    $userLike.on('click', function () {
      // 如果已经 like 过
      if ($userLike.attr('disabled')) return
      $likeText.text('已赞')
      $likeSum.text($likeSum.data('num') + 1)
      $userLike.attr('disabled', 'disabled')
      $.ajax({
        url,
        type: 'post',
        dataType: 'json',
        data: params,
      }).done(function (data) {
        callback(null, data, $userLike[0])
      }).fail(function (err) {
        callback(err, null, $userLike[0])
      })
    })
  }
}


/**
 * [移动端] 通用用户 like 事件，需要在 DOM Ready 之后调用
 * PC 端方法请参见 initMobileUserLikeEvent
 * @param url - 请求 url
 * @param params - 请求参数
 * @param callback - 完成后的回调函数
 */
export const initMobileUserLikeEvent = (
  url: string,
  params: object,
  callback: (err: any, data: { code: number, message: string, data: any } | null, element: HTMLElement) => void
) => {
  const $userlike = document.querySelector('#user-like') as HTMLButtonElement
  if (!$userlike.disabled) {
    $userlike.addEventListener('click', () => {
      if ($userlike.disabled) return
      $userlike.children[0].innerHTML = '已赞'
      $userlike.children[1].innerHTML = parseInt($userlike.children[1].getAttribute('data-num')) + 1 as any
      $userlike.disabled = true
      ajax({
        url,
        methods: 'POST',
        params,
        callback: (err, data) => {
          callback(err, data, $userlike)
        },
      })
    })
  }
}