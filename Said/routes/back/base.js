//Said后台
var blogs = require('./blogs'),
    saids = require('./saids');
    

module.exports = function (app) {
    app.use('/back', blogs);
    app.use('/back/said', saids);
}