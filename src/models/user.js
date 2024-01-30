var mongoose = require('mongoose');

var userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please enter a username!'],
        },
        password: {
            type: String,
            required: [true, 'Please enter a password!'],
        },
        profile_picture: {
            type: String,
            required: [true, 'Please enter a profile picture!'],
        },
        liked_posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],
        bookmarked_posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],   
        created_posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
