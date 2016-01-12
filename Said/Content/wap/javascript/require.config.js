require.config({
  baseUrl: '/Content/JavaScript',
  paths: {
    'jquery': 'jQuery-2.1.1.min'
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

  }
});