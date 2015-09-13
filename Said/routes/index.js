var express = require('express');
var router = express.Router();
/** 
 * Models
 ** /

 
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: '听说' });//如果向重写布局，则使用：layout: 'other'，不想继承使用layout: false
});



module.exports = router;