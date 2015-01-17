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
        mustCompleteBy: req.body.completed_by,
        requester: req.user._id,
        loc: [req.body.lon, req.body.lat]
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

router.get('/requests', function(req, res){
    res.render('index', { title: 'Express' });
});

module.exports = router;