(function () {
    var test = {
        log: function () {
            console.log('linkFly');
        }
    };
    window.test = test;
    return test;
})();
define('Defer', function () {
    return {
        log: function () {
            console.log('defer');
        }
    };
});