"use strict";
var express = require('express');
var router = express.Router();

var Request = require('../models/request');

router.post('/requests', function(req, res) {
    var request = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        startingPrice: req.body.price,
        mustCompleteBy: new Date(req.body.completed_by),
        requester: req.user._id,
        loc: [req.body.lon, req.body.lat],
        address: req.address
    };
    Request.addRequest(request, function(err, result) {
        if (err) console.log(err);
        res.json(result);
    });
});

router.get('/requests', function(req, res) {
    var loc, rad;
    rad = 15 || req.query.rad;
    loc = [req.query.lon, req.query.lat];
    Request.findRequests(rad, loc, function(err, requests) {
        if (err) res.send(500);
        else res.json(requests);
    });

});

router.get('/request/:request_id', function(req, res) {

});

router.post('/request/:request_id/bids', function(req, res) {

});

router.get('/request/:request_id/bids', function(req, res){

});

router.post('/request/reviews', function(req, res) {

});

router.get('/request/reviews', function(req, res){

});

router.get('/user/:id', function(req, res){

});

module.exports = router;