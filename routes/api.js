"use strict";
var express = require('express');
var router = express.Router();

var Request = require('../models/request');
var User = require('../models/user');
var _ = require('underscore');
var RADIUS_OF_EARTH = 3959;

router.post('/requests', function(req, res) {
    var point = {type: "Point", coordinates: [parseFloat(req.body.location.lon), parseFloat(req.body.location.lat)]};
    var request = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        startingPrice: req.body.start_price,
        mustCompleteBy: new Date(req.body.completed_by),
        requesterId: req.user._id,
        loc: point,
        address: req.body.address
    };
    console.log(request);
    Request.addRequest(request, function(err, result) {
        if (err) console.log(err);
        res.json(result);
    });
});

router.get('/requests', function(req, res) {
    var loc, rad;
    rad = (15 || req.query.rad)/(RADIUS_OF_EARTH);

    loc = [parseFloat(req.query.lon), parseFloat(req.query.lat)];
    Request.findRequests(rad, loc, function(err, requests) {
        if (err) res.status(500).send(err);
        else res.json(requests);
    });

});

router.get('/request/:id', function(req, res) {
    Request.findById(req.params.id, function(err, request) {
        __injectUser(request,"requesterId", function(err,result){
            request = result;
            __injectUsers(request.bids,"userId", function(err, result){
                request.bids = result;

                if (err) res.status(500).send(err);
                else res.json(request);
            })
        });
    })
});

router.post('/request/:id/bids', function(req, res) {
    Request.addBid(req.params.id,req.user._id, req.body.price, function(err, request){
        if (err) res.status(500).send(err);
        else res.json(request);
    });
});

//deprecated
router.get('/request/:id/bids', function(req, res){
    Request.findById(req.params.id, function(err, request) {
        if (err) res.status(500).send(err);
        else {
            res.send(request.bids);
        }
    })
});

//todo check uniqueness constraints
//todo duplicate req.user._id passing
router.post('/request/:id/reviews', function(req, res) {
    var rating = parseInt(eq.body.rating);
    if (rating > 5) rating = 5;
    if (rating < 1) rating = 1;
    var review = {
        rating: rating,
        comment: req.body.comment,
        by: req.user._id
    };

    Request.addReview(req.params.id, req.user._id, review, function(err, result) {
        if (err) res.status(500).send(err);
        else {
            res.send(result.reviews);
        }
    })
});


//accept a bid as the requester
router.patch('/request/:request_id/bid/:bid_id/accept', function(req, res){
    Request.acceptRequest(req.user, req.params.request_id, req.params.bid_id, function(err, request) {
        if (err) {res.status(500).send(err);}
        else {res.send(request)}
    });
});

//decline request in which your bid was accepted as the fulfiller
router.patch('/request/:id/decline', function(req, res){
    Request.declineRequest(req.user, req.params.id, function(err, request){
       if (err) {res.status(500).send(err);}
        else {res.send(request)}
    });
});


//pay and lock the request
router.patch('/request/pay', function(req, res){

});


/* aggregate data */

//return data for another user
router.get('/user/:id', function(req, res){
    __getPublicUser(req.params.id, function(err, user){
        if (err) res.status(500).send(err);
        else res.send(user);
    })
});

router.get('/user/:user_id/reviews/rater', function(req,res){
   var userid = req.params.user_id, obj = {};
    Request.find({"reviews.byId": userid}, function(err, reviews){
        __getPublicUser(req.user._id, function(err, user) {
            if (err) res.status(500).send(err);
            obj.reviews = reviews;
            obj.user = user;
            res.send(obj);
        })
    })
});

router.get('/user/:user_id/reviews/rated', function(req,res){
    var userid = req.params.user_id, obj = {};
    Request.find({"reviews.forId": userid}, function(err, reviews){
        __getPublicUser(req.user._id, function(err, user){
            if (err) res.status(500).send(err);
            obj.reviews = reviews;
            obj.user = user;
            res.send(obj);
        })
    })
});

router.get('/me/reviews', function(req, res){
    var obj = {};
    Request.find({$or: [{"reviews.byId": userid}, {"reviews.forId": userid}]}, function(err, reviews){
        __getPublicUser(req.user._id, function(err, me){
            if (err) res.status(500).send(err);
            obj.reviews = reviews;
            obj.me = me;
            res.send(obj);
    })
});

router.get('/me/reviews/rater', function(req,res){
    var obj = {};
    Request.find({"reviews.byId": req.user._id}, function(err, reviews){
        __getPublicUser(req.user._id, function(err, me){
            if (err) res.status(500).send(err);
            obj.reviews = reviews;
            obj.me = me;
            res.send(obj);
        })
    })
    })
});

router.get('/me/reviews/rated', function(req,res){
    var obj = {};
    Request.find({"reviews.forId": req.user._id}, function(err, reviews){
        __getPublicUser(req.user._id, function(err, me) {
            if (err) res.status(500).send(err);
            obj.reviews = reviews;
            obj.me = me;
            res.send(reviews);
        })
    })
});

router.get('/me', function(req, res) {
    __getPublicUser(req.user._id, function(err, user){
        if (err) res.status(500).send(err);
        else res.send(user);
    });
});

//return my recent requests and bids
router.get('/me/requests_bids', function(req, res) {
    var recent = {};
    Request.find({requesterId: req.user._id}, function(err, requests){
        requests.forEach(function(request, ind){
            __injectUsers(request.bids, "userId", function(err, bids) {
                requests[ind].bids = bids;

                if (ind == requests.length - 1) {
                    Request.find({'bids.userId': req.user._id}, function (err, bids) {
                        __getPublicUser(req.user._id, function (err, me) {
                            recent.requests = requests;
                            recent.bids = bids;
                            recent.me = me;
                            res.send(recent);
                        });
                    });
                }
            });

        });
    });
});

function __getPublicUser(userId, callback) {
    User.findById(userId, function(err, user){
        var permit = ["displayName", "profilePic", "rating"];
        if (err) {return callback(err)}
        var sanitizedUser={};
        permit.forEach(function(val){
            sanitizedUser[val] = user[val];
        });
        return callback(null, sanitizedUser);
    });
}

//target is a single user
function __injectUser(target, userIdParam, callback) {
    var userid = target[userIdParam];
    __getPublicUser(userid, function(err, userfields){
        target._doc.user = {};
        target._doc.user = userfields;
        callback(null, target);
    })
}
//target is an array
//userIdParam is the param in which userid for searching can be found
function __injectUsers(target, userIdParam, callback){
    var userList = [];
    target.forEach(function(val, ind){
        console.log(val);
        var userid = val[userIdParam];
        __getPublicUser(userid, function(err, res){
            if (err) console.log(err);
            var userObj = {};
            userObj[userid] = res;
            userList.push(userObj);
            if (ind == target.length-1) {
                //console.log(userList);
                target = _.map(target, function(val){
                    var userid = val[userIdParam];
                    //console.log(userList);
                    for (var i=0; i<userList.length; i++) {
                        if (Object.keys(userList[i])[0] == userid) {
                            val._doc.user = {};
                            val._doc.user = userList[i][userid];
                            //console.log(val);
                            //console.log(users[i][userId]);
                            break;
                        }
                    }
                    return val;
                });
                callback(null, target)
            }
        });
    });

}

module.exports = router;