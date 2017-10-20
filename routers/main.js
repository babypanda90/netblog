var express = require('express');
var router = express.Router();

var Category = require("../models/Category")
var Content = require("../models/Content")

// common data
var data;
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        category: []
    }

    Category.find().sort({_id: -1}).then(function (category) {
        data.category = category;
        next();
    });
});

router.get('/', function(req, res) {

    data.cate_id = req.query.cate_id || "";
    data.category_count = 0;
    data.curr_page = Number(req.query.page || 1);
    data.page_size = 10;
    data.pages_quantity = 0;

    var where = {};
    if (data.cate_id) {
        where.category = data.cate_id;
    }

    Content.where(where).count().then(function (category_count) {
        data.category_count = category_count
        data.pages_quantity = Math.ceil(data.category_count / data.page_size);
        
        data.curr_page = Math.min(data.curr_page, data.pages_quantity);
        data.curr_page = Math.max(data.curr_page, 1);

        var pages_jump = (data.curr_page - 1) * data.page_size;
 
        return Content.where(where).find().sort({_id : -1}).limit(data.page_size).skip(pages_jump).populate(["category", "user"]);

    }).then(function (content) {
        data.content = content;
        res.render('main/index', {
            data: data
        });
    });

});

router.get("/detail", function(req, res) {
    var id = req.query.cont_id || "";

    Content.findOne({
        _id: id
    }).then(function (cont) {
        cont.views++;
        cont.save();
        data.cont = cont;
        res.render("main/detail", {
            data: data
        });
    });
});

module.exports = router;