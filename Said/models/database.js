var mongoose = require('mongoose');
var db = mongoose.connect('localhost', 'said'),
    Schema = mongoose.Schema;
//TODO 这里为什么不能捕捉error
//db.on('error', function (error) {
//    console.log(error);
//});

var tagSchema = new mongoose.Schema({
    tagName: String,
    date: Date,
    count: Number,
    isDelete: Number
}, {
    collection: 'tags'
});

exports.tagSchema = tagSchema;
exports.tagModel = mongoose.model('Tag', tagSchema);



var blogSchema = new mongoose.Schema({
    title: String,
    date: Date,
    //关系
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    summary: String,
    script: String,
    flag: Number,
    pv: Number,
    fileName: String,
    //缩略图名称
    thumbnail: String,
    context: String,
    html: String,
    css: String,
    comments: Number,
    clicks: Number,
    classify: String,
    //数据状态
    satus: Number
}, {
    collection: 'blogs'
});


exports.blogSchema = blogSchema;
exports.blogModel = mongoose.model('Blog', blogSchema);


//process.on('SIGINT', function () {
//    mongoose.connection.close(function () {
//        console.log('Mongoose disconnected through app termination');
//        process.exit(0);
//    });
//});

//module.exports = function (callback) {
//    db.once('open', function () {

//    });
//};
