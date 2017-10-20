var express = require('express');
var swig = require('swig'); // template model engine
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var Cookies = require("cookies");
var User = require("./models/User");

//create web app
var app = express();

//configure current app template engine
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');
swig.setDefaults({
    cache: false // clear browser buffer cache
})

// bodyparser config
app.use(bodyParser.urlencoded({extended: true}));

// cookie config
app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);

    req.userInfo = {};

    if (req.cookies.get("userInfo")) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            
            //isAdmin
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
            })
        }catch(e) {
        }
    }

    next();
})

//deploy static files : css, javascript, image
app.use('/public', express.static(__dirname + '/public'));

//router, function, request, response
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


//listen requests
mongoose.connect('mongodb://localhost:27018/netBlog', function(err) {
    if(err) {
        console.log('Database connection failed !');
    }
    else {
        console.log('Database connection succeed !');
        app.listen(8080);
    }
});
