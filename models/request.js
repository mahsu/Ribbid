"use strict";
var mongoose = require('mongoose');
var User = require('user');

var bidSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    price: Number,
    accepted: Boolean,
    timestamp: {type: Date, default: Date.now}
});

var reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    byId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    forId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    timestamp: {type: Date, default: Date.now}
});

var requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    tags: [String],
    mustCompleteBy: Date,
    startingPrice: Number,
    requesterId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    fulfillerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    address: String,
    loc: {type: [Number], index: '2dsphere'},
    bids: [bidSchema],
    acceptedBidId: {type: mongoose.Schema.Types.ObjectId},
    paid: Boolean,
    reviews: [reviewSchema],
    timestamp: {type: Date, default: Date.now}
});

//location: [lon, lat]
requestSchema.statics.addRequest = function(request, callback){
    var newRequest = new this(request);
    newRequest.save(function (err){
        callback(err, newRequest);
    });

};

//todo restrict access
requestSchema.statics.deleteRequest = function(id, callback){
    var that = this;
    if (__isLocked()) {return callback()}
    that.findById(id).remove(function(err, res) {
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

//todo check date
requestSchema.statics.addBid = function(requestId, placedBy, price, callback){
    var that = this;
    if (__isLocked()) {return callback()}
    that.findById(requestId, function(err, res){
        if (err) return callback(err);
        res.bids.push({userId: placedBy, price: price});
        res.save(function(err){
            callback(err);
        })
    })
};

//todo check date
requestSchema.statics.deleteBid = function(requestId, bidId, callback){
    var that = this;
    if (__isLocked()){return callback()}
    that.findById(requestId, function(err, res) {
        var doc = res.bids.id(bidId).remove();
        doc.save(function(err){
            callback(err);
        });
    })
};

//todo check review constraints - one per user, valid user
//todo validate review fields, must be paid
requestSchema.statics.addReview = function(requestId, userId, newReview, callback) {
    var that = this;
    that.findById(requestId, function(err, request){
        if (err) return callback(err);
        request.reviews.push(newReview);
        request.save(function(err) {
            callback(err);
        })
    })
};

//todo check date
//accept a bid as a requester
requestSchema.statics.acceptRequest = function(userId, requestId, bidId, callback){
    var that = this;
    if (__isLocked()) {return callback()}
    that.findById(requestId, function(err, request){
        if (err) {return callback(err)}
        //check that userId is the requester
        if (request.requesterId == userId) {
            //check that acceptedBidId is null
            if (request.acceptedBidId == null && request.fulfillerId == null) {
                var acceptedBid = request.bids._id(bidId);
                request.acceptedBidId = acceptedBid._id;
                request.fulfiller = acceptedBid.userId;
                request.save(function(err){
                    return callback(err);
                });
            }
        }
        callback("Invariant error.")
    });
};

requestSchema.statics.declineRequest = function(userId, requestId, callback){
    var that = this;
    if (__isLocked()) {return callback()}
    that.findById(requestId, function(err, request){
        if (err) {return callback(err)}
        //check that request has been accepted
        if (request.acceptedBidId == null) {return callback("Request not accepted.")}
        //check that user making the request had been accepted
        if (request.fulfillerId != userId) {return callback("No permission.")}
        request.acceptedBidId = null;
        request.fulfillerId = null;
        request.save(function(err){
            callback(err);
        })
    })
};

//check if a request is locked for changes (exclude reviews)
function __isLocked(review) {
    return review.paid;
}

module.exports = mongoose.model('Request', requestSchema);