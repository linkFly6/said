//Said主站
var index = require('./index');
var users = require('./users');

module.exports = function (app) {
    app.use('/', index);
    app.use('/users', users);
    app.use('/tags', require('./tag'));
}