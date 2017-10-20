var express = require('express');

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

var router = express.Router();

router.use(function(req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send("Sorry, only admin can enter this bashboard !")
        return;
    }
    next();
});

// index
router.get("/", function(req, res) {
    res.render("admin/index", {
        userInfo: req.userInfo
    });
});

// user label
router.get("/user", function(req, res) {
    /*
     * limit(n) : db page_size
     * skip(m) : db pages_jump
    */
    var curr_page = Number(req.query.page || 1);
    var page_size = 20;
    
    User.count().then(function (users_count) {
        var pages_quantity = Math.ceil(users_count / page_size);

        curr_page = Math.min(curr_page, pages_quantity);
        curr_page = Math.max(curr_page, 1);

        var pages_jump = (curr_page - 1) * page_size;

        User.find().limit(page_size).skip(pages_jump).then(function (users) {
            res.render("admin/user_index", {
                userInfo: req.userInfo,
                users: users,
                curr_page: curr_page,
                page_size: page_size,
                items_count: users_count,
                pages_quantity: pages_quantity
            });
        });
    });
});


// category label
router.get("/category", function(req, res) {
    /*
     * limit(n) : db page_size
     * skip(m) : db pages_jump
    */
    var curr_page = Number(req.query.page || 1);
    var page_size = 20;
    
    Category.count().then(function (category_count) {
        var pages_quantity = Math.ceil(category_count / page_size);

        curr_page = Math.min(curr_page, pages_quantity);
        curr_page = Math.max(curr_page, 1);

        var pages_jump = (curr_page - 1) * page_size;

        Category.find().sort({_id : -1}).limit(page_size).skip(pages_jump).then(function (category) {
            res.render("admin/category_index", {
                userInfo: req.userInfo,
                category: category,
                curr_page: curr_page,
                page_size: page_size,
                items_count: category_count,
                pages_quantity: pages_quantity
            });
        });
    });
});

router.get("/category/add", function(req, res) {
    res.render("admin/category_add", {
        userInfo: req.userInfo
    });
});

router.post("/category/add", function(req, res) {
    var categoryname = req.body.category_name || "";

    if (categoryname == "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            err_message: "category is empty !",
            err_url: ""
        });
        return;
    }

    Category.findOne({
        categoryname: categoryname
    }).then(function (rs) {
        if (rs) {
            res.render("admin/error", {
                userInfo: req.userInfo,
                err_message: "category exists !",
                err_url: ""
            });
            return Promise.reject();
        }
        else {
            return new Category({
                categoryname: categoryname
            }).save();
        }
    }).then(function (newCategory) {
        res.render("admin/success", {
            userInfo: req.userInfo,
            succ_message: "add new category successfully !",
            succ_url: "/admin/category"
        });
        return;
    });
});

router.get("/category/edit", function(req, res) {
    var id = req.query.id || "";

    Category.findOne({
        _id: id
    }).then(function (category) {
        if(!category) {
            res.render("admin/error", {
                userInfo: req.userInfo,
                err_message: "category dose not exist !"
            });
            return Promise.reject();
        }
        else {
            res.render("admin/category_edit", {
                userInfo: req.userInfo,
                category: category
            })
            return;
        }
    });
});

router.post("/category/edit", function(req, res) {
    var id = req.query.id || "";
    var categoryname = req.body.category_name || "";

    Category.findOne({
        _id: id
    }).then(function (category) {
        if(!category) {
            res.render("admin/error", {
                userInfo: req.userInfo,
                err_message: "category dose not exist !"
            });
            return Promise.reject();
        }
        else {
            if(category.categoryname == categoryname){
                res.render("admin/success", {
                    userInfo: req.userInfo,
                    succ_message: "edit category successfully !",
                    succ_url: "/admin/category"
                });
                return Promise.reject();
            }
            else {
                return Category.findOne({
                    _id: {$ne: id},
                    categoryname: categoryname
                }).then(function (sameCategory) {
                    if(sameCategory) {
                        res.render("admin/error", {
                            userInfo: req.userInfo,
                            err_message: "category name exists !",
                            err_url: ""
                        });
                        return Promise.reject();
                    }
                    else {
                        return Category.update({
                            _id: id,
                        }, {
                            categoryname: categoryname
                        });
                    }
                }).then(function () {
                    res.render("admin/success", {
                        userInfo: req.userInfo,
                        succ_message: "edit category successfully !",
                        succ_url: "/admin/category"
                    });
                    return;
                });
            }
        }
    });
});

router.get("/category/delete", function (req, res) {
    var id = req.query.id || "";
    
    Category.remove({
        _id: id
    }).then(function () {
        res.render("admin/success", {
            userInfo: req.userInfo,
            succ_message: "delete category successfully !",
            succ_url: "/admin/category"
        });
        return;
    });
});

// content label
router.get("/content", function (req, res) {
    /*
     * limit(n) : db page_size
     * skip(m) : db pages_jump
    */
    var curr_page = Number(req.query.page || 1);
    var page_size = 20;
    
    Content.count().then(function (content_count) {
        var pages_quantity = Math.ceil(content_count / page_size);

        curr_page = Math.min(curr_page, pages_quantity);
        curr_page = Math.max(curr_page, 1);

        var pages_jump = (curr_page - 1) * page_size;

        Content.find().sort({_id : -1}).limit(page_size).skip(pages_jump).populate(["category", "user"]).then(function (content) {
            res.render("admin/content_index", {
                userInfo: req.userInfo,
                content: content,
                curr_page: curr_page,
                page_size: page_size,
                items_count: content_count,
                pages_quantity: pages_quantity
            });
        });
    });

});

router.get("/content/add", function (req, res) {

    Category.find().sort({_id: -1}).then(function (category) {
        res.render("admin/content_add", {
            userInfo: req.userInfo,
            category: category
        });
    });

});

router.post("/content/add", function (req, res) {

    if (req.body.title == "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            err_message: "title is empty !"
        });
        return;
    }

    new Content({
        category: req.body.category_id,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        detail: req.body.detail
    }).save().then(function (rs) {
        res.render("admin/success", {
            userInfo: req.userInfo,
            succ_message: "add content successfully !",
            succ_url: "/admin/content"
        });
        return;
    });

});

router.get("/content/edit", function (req, res) {
    var id = req.query.id || "";

    var category = [];

    Category.find().sort({_id: -1}).then(function (rs) {
        category = rs;

        return Content.findOne({
            _id: id
        }).populate("category").then(function (content) {
            if(!content) {
                res.render("admin/error", {
                    userInfo: req.userInfo,
                    err_message: "content dose not exist !"
                });
            }
            else {
                res.render("admin/content_edit", {
                    userInfo: req.userInfo,
                    category: category,
                    content: content
                });
            }
        });
    });
    
});

router.post("/content/edit", function(req, res) {
    var id = req.query.id || "";

    if (req.body.title == "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            err_message: "title is empty !"
        });
        return;
    }

    Content.update({
        _id: id
    }, {
        category: req.body.category_id,
        title: req.body.title,
        description: req.body.description,
        detail: req.body.detail
    }).then(function () {
        res.render("admin/success", {
            userInfo: req.userInfo,
            succ_message: "edit content successfully !",
            succ_url: "/admin/content"
        });
    });
});

router.get("/content/delete", function(req, res) {
    var id = req.query.id || "";

    Content.remove({
        _id: id
    }).then(function () {
        res.render("admin/success", {
            userInfo: req.userInfo,
            succ_message: "delete content successfully !",
            succ_url: "/admin/content"
        });
    })
})




module.exports = router;