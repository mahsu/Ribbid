"use strict";
var mongoose = require('mongoose');

var bidSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    price: Number,
    accepted: Boolean,
    timestamp: {type: Date, default: Date.now}
});

var reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    by: {type: Schema.Types.ObjectId, ref: 'User'},
    for: {type: Schema.Types.ObjectId, ref: 'User'},
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
    address: String,
    loc: {type: [Number], index: '2dsphere'},
    bids: [bidSchema],
    accepted_bid: {type: mongoose.Schema.Types.ObjectId},
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

requestSchema.statics.deleteRequest = function(id, callback){
    var that = this;
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

requestSchema.statics.addBid = function(requestId, placedBy, price, callback){
    var that = this;
    that.findById(requestId, function(err, res){
        if (err) return callback(err);
        res.bids.push({user: placedBy, price: price});
        res.save(function(err){
            callback(err);
        })
    })
};


requestSchema.statics.deleteBid = function(requestId, bidId, callback){
    var that = this;
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

//check if a request is locked for changes
function __isLocked(review) {
    return review.paid;
}

module.exports = mongoose.model('Request', requestSchema);