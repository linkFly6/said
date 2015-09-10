//Said主站
var routes = require('./index');
var users = require('./users');

module.exports = function (app) {
    app.use('/', routes);
    app.use('/users', users);
}