var database = require('./database'),
    util = require('util'),
    blogModel = database.blogModel;

function Blog(model) {
    this.title = model.title;
    this.date = model.date;
    this.tags = model._id || null;
    this.summary = model.summary;
    this.script = model.script;
    this.flag = model.flag;
    this.pv = model.pv || 0;
    this.fileName = model.fileName;
    //this.thumbnail = model.thumbnail;
    this.context = model.context;
    this.html = model.html;
    this.css = model.css;
    this.comments = model.comments || 0;
    this.clicks = model.clicks || 0;
    this.classify = model.classify;
    this.satus = model.satus || 0;
};

Blog.prototype.save = function (callback) {
    var model = {
        title: this.title,
        date: this.date,
        //关系
        tags: this.tags,
        summary: this.summary,
        script: this.script,
        flag: this.flag,
        pv: this.pv,
        fileName: this.fileName,
        //缩略图名称
        thumbnail: this.thumbnail,
        context: this.context,
        html: this.html,
        css: this.css,
        comments: this.comments,
        clicks: this.clicks,
        classify: this.classify,
        //数据状态
        satus: this.satus
    };
    (new blogModel(model)).save(function (error) {
        if (error) {
            return callback(error);
        };
        callback(null, model);
    });
};


Blog.queryByTagId = function (tagId, skip, limit, callback) {
    if (tagId) {
        //参见http://mongoosejs.com/docs/api.html#query_Query-skip
        blogModel.find().populate({ path: 'tags', match: { _id: tagId } }).skip(skip).limit(limit).exec(callback);//子查询tags集合
    } else
        blogModel.find().skip(skip).limit(limit).exec(callback);
};

Blog.query = function () {

};


module.exports = Blog;