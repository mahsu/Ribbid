"use strict";
var mongoose = require('mongoose');

var bidSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    price: Number,
    timestamp: {type: Date, default: Date.now}
});

var requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    tags: [String],
    mustCompleteBy: Date,
    startingPrice: Number,
    requester: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    fulfiller: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    loc: {type: [Number], index: '2dsphere'},
    bids: [bidSchema],
    timestamp: {type: Date, default: Date.now}
});

//location: [lon, lat]
requestSchema.statics.addRequest = function(request, callback){
    var newRequest = new this(request);
    newRequest.save(function (err){
        callback(err, newRequest);
    });

};

requestSchema.statics.deleteRequest = function(id, callback){
    var that = this;
    that.find({_id: id}).remove(function(err, res) {
        if (err)
            console.log(err);
        callback(err, res);
    });
};

//maxdist in meters
requestSchema.statics.findRequests = function(maxdist,location, callback) {
    var that = this;
    var findParams = {
        loc: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: location
                },
                $maxDistance: maxdist
            }
        }
    };
    that.find(findParams, function(err, results) {
        if (err)
            callback(err);
        else {
            callback(null, results);
        }
    })
};

requestSchema.statics.addBid = function(requestId, placedBy, price, callback){
    var that = this;
    that.findById(requestId, function(err, res){
        if (err) console.log(err);
        res.bids.push({user: placedBy, price: price});
        res.save(function(err){
            callback(err);
        })
    })
};

requestSchema.statics.deleteBid = function(requestId, bidId, callback){
    if (err) console.log(err);
    var that = this;
    that.findById(requestId, function(err, res) {
        var doc = res.bids.id(bidId).remove();
        doc.save(function(err){
            callback(err);
        });
    })

};

module.exports = mongoose.model('Request', requestSchema);