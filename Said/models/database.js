var mongoose = require('mongoose');
var db = mongoose.connect('localhost', 'said');
db.on('error', function (error) {
    console.log(error);
});

var tagSchema = new mongoose.Schema({
    tagName: String,
    date: Date,
    count: Number,
    isDelete: Number
}, {
    collection: 'tags'
});

exports.tagSchema = tagSchema;
exports.tagModel = mongoose.model('Tag', userSchema);

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
