//Said主站
var index = require('./index');
var users = require('./users');
var blogs = require('./home/blogs');


module.exports = function (app) {
    app.use('/', index);
    app.use('/blogs', blogs);
    app.use('/users', users);
    app.use('/tags', require('./tag'));
}