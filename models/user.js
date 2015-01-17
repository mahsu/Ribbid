var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    provider: String,
    rating: [Number],
    declines: Number,
    providerId: String,
    displayName: String,
    profilePic: String,
    email: String

});

module.exports = mongoose.model('User', userSchema);