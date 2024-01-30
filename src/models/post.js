const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    post_id: {
        type: String,
        unique: true,
        required: [true, "Please add a post id!"],
    },

    title: {
        type: String,
        required: [true, "Please add a title!"],
    },

    content: {
        type: String,
        required: [true, "Please add a content!"],
    },

    author: {
        type: String,
        required: [true, "Please add a author!"],
    },

    tag: {
        type: String,
        required: [true, "Please add a tag!"],
    },

    post_image_url: {
        type: String,
    },

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    bookmark_count: {
        type: Number,
        default: 0,
    },
    likes_count: {
        type: Number,
        default: 0,
    },
    posted_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Post", postSchema);