//Said后台
var blogs = require('./blogs');

module.exports = function (app) {
    app.use('/back', blogs);
}