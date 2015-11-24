var express = require('express');
var router = express.Router();
/** 
 * Models
 **/
var Blog = require('../../models/blog');

var testData = function () {
    new Blog({
        title: '这是标题',
        date: new Date,
        summary: '突然想要走一段陌生的路，让自己无谓一点。',
        context: '突然想要走一段陌生的路，让自己无谓一点。\n外面突然下起了雨，偶尔让晚九点的天空白了一瞬。就好像天公懂的作美，陪衬着你的心情，加一杯调料。',
        html: '<p>突然想要走一段陌生的路，让自己无谓一点。</p><p> 外面突然下起了雨，偶尔让晚九点的天空白了一瞬。就好像天公懂的作美，陪衬着你的心情，加一杯调料。</p>',
        classify: 'javascript随笔'
    }).save(function (error, model) {
        if (error)
            console.log('error', error);
        else
            console.log('done', model);
    });
    new Blog({
        title: '这是标题2',
        date: new Date,
        summary: '突然很安静，就好像世界空了一点点，灯已经关上，夜已经沉重。',
        context: '突然很安静，就好像世界空了一点点，灯已经关上，夜已经沉重。\n不由自主的学会疗伤，从一个未知点开始，不由自主的，也许是从一个闪电，就如灵感一般把控不住的。这是王者的法则？还是弱者的悲情？',
        html: '<p>突然很安静，就好像世界空了一点点，灯已经关上，夜已经沉重。</p><p>不由自主的学会疗伤，从一个未知点开始，不由自主的，也许是从一个闪电，就如灵感一般把控不住的。这是王者的法则？还是弱者的悲情？</p>',
        classify: 'linkFly'
    }).save(function (error, model) {
        if (error)
            console.log('error1', error);
        else
            console.log('done1', model);
    });
};

/* GET home page. */
//命中url：/blogs
router.get('/', function (req, res, next) {
    //testData();
    
    res.render('home/blogs', { title: '这是博客' });//如果向重写布局，则使用：layout: 'other'，不想继承使用layout: false
});


//命中url：/blogs/tag/123
router.get('/tag/:tagId', function (req, res, next) {
    var tagId = req.params.tagId;
    //进行数据库tag查询
    //Blog.queryByTagId(tagId, 10, 10, function (error) {
    //    console.log('发生error：', error);
    //});
    
    res.render('home/blogs', { title: '这是博客' });//如果向重写布局，则使用：layout: 'other'，不想继承使用layout: false
});


module.exports = router;