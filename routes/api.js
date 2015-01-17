"use strict";
var express = require('express');
var router = express.Router();

var Request = require('./models/request');

router.post('/', function(req, res) {
    var request = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        startingPrice: req.body.price,
        mustCompleteBy: req.body.completeBy,
        requester: req.user._id,
        loc: [req.body.lon, req.body.lat]
    };
    Request.addRequest(request, function(err, res) {

    });


    res.render('index', { title: 'Express' });
});
