"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/app', function(req, res) {
  res.render('index');
});

router.get('/', function(req, res) {
  res.render('login')
});

router.get('/partials/:name', function(req, res) {
  res.render('partials/' + req.params.name);
});

module.exports = router;
