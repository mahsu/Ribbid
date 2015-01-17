var bidSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    price: Number,
    timestamp: {type: Date, default: Date.now}
});

var requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    tags: [String],
    mustCompleteBy: Date,
    startingPrice: Number,
    requester: {type: Schema.Types.ObjectId, ref: 'User'},
    fulfiller: {type: Schema.Types.ObjectId, ref: 'User'},
    loc: {type: [Number], index: '2dsphere'},
    bids: [bidSchema],
    timestamp: {type: Date, default: Date.now}
});

//location: [lon, lat]
requestSchema.addRequest = function(request, callback){
    var newRequest = new this(request);
    newRequest.save(function (err){
        callback(err, newRequest);
    });

};

requestSchema.deleteRequest = function(id, callback){
    var that = this;
    that.find({_id: id}).remove(function(err, res) {
        if (err)
            console.log(err);
        callback(err, res);
    });
};

requestSchema.addBid = function(requestId, placedBy, price, callback){
    var that = this;
    that.findById(requestId, function(err, res){
        if (err) console.log(err);
        res.bids.push({user: placedBy, price: price});
        res.save(function(err){
            callback(err);
        })
    })
};

requestSchema.deleteBid = function(requestId, bidId, callback){
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