const Post = require('../models/post');

async function generatePostId() {
    try {
        const latestPost = await Post.aggregate([
            {
                $group: {
                    _id: null,
                    maxPostId: { $max: { $toInt: '$post_id' } },
                },
            },
        ]);

        const latestPostId =
            latestPost.length > 0 ? latestPost[0].maxPostId : 0;

        const newPostId = String(latestPostId + 1).padStart(4, '0');

        return newPostId;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to generate post ID');
    }
}
module.exports = generatePostId;