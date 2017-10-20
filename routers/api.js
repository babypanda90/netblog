// api functions serve for the ajax

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require("../models/Content")

var responseData;
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }

    next();
})

// responseData = {
//     code: 0,
//     message: ''
// };

router.post("/user/register", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if (username == '') {
        responseData.code = 1;
        responseData.message = "username is empty !";
        res.json(responseData);
        return;
    }

    if (password == '') {
        responseData.code = 2;
        responseData.message = "password is empty !";
        res.json(responseData);
        return;
    }

    if (password != repassword) {
        responseData.code = 3;
        responseData.message = "two input password must be consistent !";
        res.json(responseData);
        return;
    }

    User.findOne({
        username: username
    }).then(function ( userInfo) {
        if ( userInfo ) {
            responseData.code = 4;
            responseData.message = "user exists !";
            res.json(responseData);
            return;
        }

        // register success
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUserInfo) {
        // console.log(newUserInfo);
        responseData.message = "register success !";
        res.json(responseData);
    });

});

router.post("/user/login", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if (username == '' || password == '') {
        responseData.code = 1;
        responseData.message = "username or password is empty !";
        res.json(responseData);
        return;
    }

    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = "username or password is wrong !";
            res.json(responseData);
            return;
        }

        // login success
        responseData.message = "login success !";
        responseData.userInfo = userInfo;
        req.cookies.set("userInfo", JSON.stringify(userInfo));
        res.json(responseData);
    })
});

// logout
router.get("/user/logout", function(req, res, next) {
    req.cookies.set("userInfo", null);
    res.json(responseData);
});

// comments
router.post("/comment/post", function(req, res, next) {
    var cont_id = req.body.cont_id || "";

    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        context: req.body.context
    }

    Content.findOne({
        _id: cont_id
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.content = newContent;
        res.json(responseData);
    }) 
})

router.get("/comment", function(req, res, next) {
    var cont_id = req.query.cont_id || "";
    
    Content.findOne({
        _id: cont_id
    }).then(function(content) {
        responseData.content = content;
        res.json(responseData);
    });

});

module.exports = router;