require.config({
    baseUrl: '/Content/Back/JavaScript',
    paths: {
        'saidAdd': 'said/addSaid',
        'classify': 'said/classify',
        'avalon': 'avalon/avalon.mobile.min',
        'groupInput': 'avalon/plug/groupInput',
        'avalonUpload': 'avalon/plug/uploadBox',
        'upload': 'so/plug/upload',
        'underscore': 'underscore',
        'showMsg': 'so/plug/showMsg',
        'dialog': 'so/plug/dialog',
        'source': 'so/plug/source',
        'markdown': ['showdown/showdown'],
        'showDownThemeGithub': 'showdown/extensions/github',
        'bsTable': ['../Plug/bootstrap-table/bootstrap-table'],
        'popup': ['avalon/plug/popup'],
        'bsTable-cn': ['../Plug/bootstrap-table/bootstrap-table-zh-CN'],
        'bs-datetimepicker': ['bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker']
    },
    packages: [
            {
                name: 'so',
                location: 'so',
                main: 'so'
            },
            {
                name: 'said',
                location: 'said',
                main: 'said'
            },
            {
                name: 'echarts',
                location: 'echarts-2.1.8/src',
                main: 'echarts'
            },
            {
                name: 'zrender',
                //location: 'http://ecomfe.github.io/zrender/src',
                location: 'zrender-master/src',
                main: 'zrender'
            }
    ],
    shim: {
        'showDownThemeGithub': ['markdown'],//依赖showdown
        'bsTable-cn': ['bsTable'],
        'bs-datetimepicker': ['jquery']
    }

});