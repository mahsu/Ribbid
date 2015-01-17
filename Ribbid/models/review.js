var reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    by: {type: Schema.Types.ObjectId, ref: 'User'},
    for: {type: Schema.Types.ObjectId, ref: 'User'},
    as: String,
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Review', reviewSchema);