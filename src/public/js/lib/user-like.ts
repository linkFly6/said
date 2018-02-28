/**
 * 通用用户 like 事件，需要在 DOM Ready 之后调用
 * @param url like 请求的 url
 * @param params 请求参数
 * @param callback 完成后的回调函数，第一个参数是错误（xhr），第二个参数是服务器返回
 */
export const initUserLikeEvent = (
  url: string,
  params: object,
  callback: (err: any, data: { code: number, message: string, data: any } | null) => void
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
        callback(null, data)
      }).fail(function (err) {
        callback(err, null)
      })
    })
  }
}