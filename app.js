"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var config = require('./config.js');

var routes = require('./routes/index');
var users = require('./routes/users');
var authRoute = require('./routes/auth');
var apiRoute = require('./routes/api')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/ribbid');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: config.setup.cookie_secret}))
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session({secret: config.setup.cookie_secret}));


function requireAuthentication(req,res, next) {
    if (req.user) {
        next();
    }
    else res.status(401).send("User is not logged in.");
}

app.use('/api', requireAuthentication, apiRoute);
app.use('/', routes);
app.use('/users', users);
app.get('/auth/login/:provider', authRoute.login);
app.get('/auth/callback/:provider', authRoute.loginCallback);
app.get('/auth/logout', authRoute.logout);

app.get('*', function(req, res) {
  res.render('app', { title: 'Express' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err.message);
        console.log(err);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
else {
    process.on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
    });

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

var debug = require('debug')('ribbid');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

