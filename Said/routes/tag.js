var Tag = require('../models/tag');
module.exports = function () {
    var tag = new Tag({ tagName: 'linkFly' });
    tag.save(function (error, data) {
        if (error) {
            console.log('发生了异常', error);
        } else {
            console.log('正确插入', data);
        }
    });
};