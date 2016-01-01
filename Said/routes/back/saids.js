﻿var express = require('express');
var router = express.Router();
/** 
 * Models
 ** /

 
/* GET home page. */
router.get('/addSaid', function (req, res) {
    //res.renderView('back/blogs', {
    //    data: { title: 'Said后台：添加文章 - 添加一篇文章' }, 
    //    layout: 'back/layout'
    //});//如果向重写布局，则使用：layout: 'other'，不想继承使用layout: false
    
    res.render('back/addSaid', {
        title: 'Said后台：添加Saaid - 添加一篇Said', 
        layout: 'back/layout'
    });//如果向重写布局，则使用：layout: 'other'，不想继承使用layout: false
});



module.exports = router;