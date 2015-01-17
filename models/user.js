var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    provider: String,
    rating: [Number],
    declines: Number,
    providerId: String,
    displayName: String,
    profilePic: String,
    email: String,
    timestamp: {type: Date, default: Date.now}
});

userSchema.statics.findOrCreate = function(profile, callback) {
    var that = this;
    console.log(profile);
    that.findOne({'providerId': profile.id}, function(err, res) {
        if (!err && res) {
            callback(null, res);
        }
        else {
            var user = new that({
                provider: profile.provider,
                providerId: profile.id,
                profilePic: "https://graph.facebook.com/" + result.fbId + "/picture?width=90&height=90",
                displayName: profile.displayName,
                email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null
            });
            user.save(function(err) {
                console.log(err);
            });
        }
    });
};


module.exports = mongoose.model('User', userSchema);