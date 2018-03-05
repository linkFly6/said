import { initMobileUserLikeEvent } from '../lib/user-like'


window.addEventListener('DOMContentLoaded', () => {
  // 用户 like
  initMobileUserLikeEvent(
    '/blog/like',
    { blogId: (window as any).blogId },
    (err, data, element) => {

    })
})

