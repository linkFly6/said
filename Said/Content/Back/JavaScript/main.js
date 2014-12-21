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
    }]
});