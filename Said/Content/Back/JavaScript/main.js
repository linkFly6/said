require.config({
    baseUrl: '/Content/Back/JavaScript',
    packages: [
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
    },
    {
        name: 'so',
        location: 'so',
        main: 'so'
    },
    {
        name: 'said',
        location: 'said',
        main: 'said'
    }],
    paths: {
        'addSaid': ['said/addSaid.js'],
        'markdown': ['showdown/showdown'],
        'showdownGithub': ['showdown/extensions/github']
    },
    shim: {
        'showdownGithub': {
            deps: ['markdown'],//依赖showdown
            exports: 'github'
        },
        'markdown': {
            exports: 'showdown'
        }
    }
});