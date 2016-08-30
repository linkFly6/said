require.config({
    urlArgs: 'v=20160830',
    baseUrl: '/Content/JavaScript',
    paths: {
        'jquery': '/Content/Back/JavaScript/jQuery-2.1.1.min',
        
    },
    packages: [
            {
                name: 'said',
                location: 'said',
                main: 'global'
            },
            {
                name: 'so',
                location: '/Content/Back/JavaScript/so',
                main: 'so'
            }
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