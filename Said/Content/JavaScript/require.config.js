require.config({
    baseUrl: '/static/w/',
    urlArgs: 'v=20160902a',
    paths: {
        'so': 'so/so'
    }
});
// 友盟统计
window._czc = window._czc || [];
_czc.push(["_setAccount", "1260021113"])
window.Umeng = {
    // 发送友盟统计事件
    event: function (category, action, label, value, classId) {
        window._czc.push(["_trackEvent", category, action, label, value, classId])
    }
}

window.addEventListener('error', function (e) {
    Umeng.event('Exception', '全局异常', JSON.stringify({
        path: e.filename, // 错误文件
        msg: e.message, // 错误信息
        lineno: e.lineno, // 错误行
        colno: e.colno // 错误列
    }), 2, '')
})
