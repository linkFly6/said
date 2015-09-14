var database = require('./database'),
    tagModel = database.tagModel;

function Tag(tag) {
    this.tagName = tag.tagName;
    this.date = tag.date || new Date;
    this.count = tag.count || 0;
    this.isDelete = tag.isDelete || 0;
};

Tag.prototype.save = function (callback) {
    var tag = {
        tagName: this.tagName,
        date: this.date,
        count: this.count,
        isDelete: this.isDelete
    };
    (new tagModel(tag)).save(function (error) {
        if (error) {
            return callback(error);
        };
        callback(null, tag);
    });
};


module.exports = Tag;