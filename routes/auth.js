"use strict";

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var config = require('../config');

if (config.setup.facebook_clientid && config.setup.facebook_clientsecret || process.env.NODE_ENV == 'PRODUCTION') {
    passport.use(new FacebookStrategy({
        profileFields: ['id', 'displayName', 'photos', 'emails'],
        clientID: config.setup.facebook_clientid,
        clientSecret: config.setup.facebook_clientsecret,
        callbackURL: config.setup.url + '/auth/callback/facebook'
    }, function (accessToken, refreshToken, profile, done) {
        User.findOrCreate(profile, done);
    }));
} else {
    console.log('Facebook login provider not configured');
}

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

exports.login = function(req, res) {
    //todo try catch invalid login
    return passport.authenticate(req.params.provider, {scope: ['public_profile', 'email', 'user_friends']})(req, res);
};

exports.loginCallback = function(req, res) {
    return passport.authenticate(req.params.provider, {
        successRedirect: '/',
        failureRedirect: '/'
    })(req, res);
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};