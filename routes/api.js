"use strict";
var express = require('express');
var router = express.Router();

var Request = require('../models/request');

var RADIUS_OF_EARTH = 3959;

//todo: empty tags is string
router.post('/requests', function(req, res) {
    var point = {type: "Point", coordinates: [parseFloat(req.body.location.lon), parseFloat(req.body.location.lat)]};
    var request = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        startingPrice: req.body.price,
        mustCompleteBy: new Date(req.body.completed_by),
        requesterId: req.user._id,
        loc: point,
        address: req.address
    };
    console.log(request);
    Request.addRequest(request, function(err, result) {
        if (err) console.log(err);
        res.json(result);
    });
});

router.get('/requests', function(req, res) {
    var loc, rad;
    rad = (15 || req.query.rad)/(3959);

    loc = [parseFloat(req.query.lon), parseFloat(req.query.lat)];
    Request.findRequests(rad, loc, function(err, requests) {
        if (err) res.status(500).send(err);
        else res.json(requests);
    });

});

router.get('/request/:id', function(req, res) {
    Request.findById(req.params.id, function(err, request) {
        if (err) res.send(500);
        else res.json(request);
    })

});

router.post('/request/:id/bids', function(req, res) {
    Request.addBid(req.params.id,req.user._id, req.query.price, function(err, res){
        if (err) res.send(500);
        else res.json(request);
    });
});

router.get('/request/:id/bids', function(req, res){
    Request.findById(req.params.id, function(err, request) {
        if (err) res.send(500);
        else {
            res.send(request.bids);
        }
    })
});

//todo check uniqueness constraints
//todo duplicate req.user._id passing
router.post('/request/:id/reviews', function(req, res) {
    var review = {
        rating: req.body.rating,
        comment: req.body.comment,
        by: req.user._id
    };

    Request.addReview(req.params.id, req.user._id, review, function(err, request) {
        if (err) res.send(500);
        else {
            res.send(result.reviews);
        }
    })
});


//accept a bid as the requester
router.put('/request/:request_id/bid/:bid_id/accept', function(req, res){
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

});

router.get('/me', function(req, res) {
   res.send(req.user);
});

//return my recent requests and bids
router.get('/me/requests_bids', function(req, res) {
    var recent = {};
    Request.find({requesterId: req.user._id}, function(err, requests){
        Request.find({'bids.userId': req.user._id}, function(err, bids){
            recent.requests = requests;
            recent.bids = bids;
            res.send(recent);
        })
    });
});


module.exports = router;