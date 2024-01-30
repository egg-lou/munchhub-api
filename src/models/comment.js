const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Please add a comment content'],
    },
    comment_author: {
        type: String,
        required: [true, 'Please add a comment author'],
    },
    comment_image_url: {
        type: String,
    },
    commentedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', commentSchema);
