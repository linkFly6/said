require.config({
    baseUrl: '/static/w/',
    urlArgs: 'v=20160902a',
    paths: {
        'groupInput': 'a/gi',
        'avalonUpload': 'a/ub',
        'upload': 'so/upload',
        'underscore': 'underscore',
        'dialog': 'so/dialog',
        'source': 'so/source',
        'highlight': 'hl/highlight',
        'showdown': 'showdown',
        'bsTable': 'bs/table',
        'popup': 'a/popup',
        'bs-date': 'bs/date',
        'echarts': 'echarts',
        'sweetalert': 'sweetalert'
    },
    packages: [
            {
                name: 'so',
                location: 'so',
                main: 'so'
            },
            //{
            //    name: 'echarts',
            //    location: 'echarts-2.1.8/src',
            //    main: 'echarts'
            //},
            //{
            //    name: 'zrender',
            //    //location: 'http://ecomfe.github.io/zrender/src',
            //    location: 'zrender-master/src',
            //    main: 'zrender'
            //}
    ],
    shim: {
        'bs-date': ['jquery'],
        'echarts': {
            exports: 'echarts'
        }
    }

});