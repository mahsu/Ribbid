var requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    tags: [String],
    complete_by: Date,
    requester: {type: Schema.Types.ObjectId, ref: 'User'},
    fulfiller: {type: Schema.Types.ObjectId, ref: 'User'},
    loc: {type: [Number], index: '2dsphere'},
    bids: [{
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        price: Number,
        timestamp: {type: Date, default: Date.now}
    }],
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Request', requestSchema);