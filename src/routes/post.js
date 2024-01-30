const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authenticateUser');
const Post = require('../models/post');
const User = require('../models/user');
const sharp = require('sharp');
const s3 = require('../config/aws');
const multerConfig = require('../config/multer');
const generatePostId = require('../utils/generatePostId');
const config = require('../config');


router.post(
    '/create_post',
    authenticateUser,
    multerConfig.single('image'),
    async (req, res) => {
        try {
            const { title, content, tag, anonymous } = req.body;
            const post_id = await generatePostId();
            const user = await User.findOne({ username: req.user.username });

            let postImage = null;

            if (req.file) {
                const resizedImageBuffer = await sharp(req.file.buffer)
                    .resize({ width: 2000, height: 2000, fit: 'inside' })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const customFilename = `${post_id}_${title.replace(
                    /\s+/g,
                    '-'
                )}.jpg`;

                const s3UploadResponse = await s3
                    .upload({
                        Bucket: config.awsBucketName,
                        Key: `post_images/${customFilename}`,
                        Body: resizedImageBuffer,
                        ContentType: req.file.mimetype,
                    })
                    .promise();

                postImage = s3UploadResponse.Location;
            }

            const newPost = new Post({
                post_id: post_id,
                title: title,
                content: content,
                author: anonymous === 'true' ? 'Anonymous' : req.user.username,
                tag: tag,
                post_image_url: postImage,
            });

            const data = await newPost.save();

            user.created_posts.push(data._id);
            await user.save();
            
            res.status(200).json({
                message: 'Post created successfully',
                post: data,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error',
            });
        }
    }
);

router.delete('/delete_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author !== req.user.username) {
            return res.status(403).json({
                message: 'You do not have permission to delete this post',
            });
        }

        await Post.findOneAndDelete({ post_id: post_id });
        console.log(`Deleted Post ID: ${post_id}`);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', post_id: post_id });
    }
});

router.put('/update_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author !== req.user.username) {
            return res.status(403).json({
                message: 'You do not have permission to update this post',
            });
        }

        const { title, content, tag } = req.body;

        post.title = title || post.title;
        post.content = content || post.content;
        post.tag = tag || post.tag;

        await post.save();

        res.status(200).json({
            message: 'Post updated successfully',
            updatedPost: post,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', post_id: post_id });
    }
});

router.get('/get_posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('author').populate('comments');
        res.status(200).json({
            posts: posts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
});

router.post('/like_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        const user = await User.findOne({ username: req.user.username });

        if (!post || !user) {
            return res.status(404).json({ message: 'Post or user not found' });
        }

        if (user.liked_posts.includes(post._id)) {
            return res.status(403).json({
                message: 'You have already liked this post',
            });
        }

        post.likes_count += 1; // Increment like count
        user.liked_posts.push(post._id);

        await post.save();
        await user.save();

        res.status(200).json({
            message: 'Post liked successfully',
            post: post,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/unlike_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        const user = await User.findOne({ username: req.user.username });

        if (!post || !user) {
            return res.status(404).json({ message: 'Post or user not found' });
        }

        if (!user.liked_posts.includes(post._id)) {
            return res.status(403).json({
                message: 'You have not liked this post',
            });
        }

        post.likes_count -= 1; // Decrement like count
        user.liked_posts = user.liked_posts.pull(post._id);

        await post.save();
        await user.save();

        res.status(200).json({
            message: 'Post unliked successfully',
            post: post,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/bookmark_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        const user = await User.findOne({ username: req.user.username });

        if (!post || !user) {
            return res.status(404).json({ message: 'Post or user not found' });
        }

        if (!Array.isArray(user.bookmarked_posts)) {
            user.bookmarked_posts = [];
        }

        if (!user.bookmarked_posts.includes(post._id)) {
            user.bookmarked_posts.push(post._id);
            post.bookmark_count += 1; // Increment bookmark count
            await user.save();
            await post.save();

            res.status(200).json({ message: 'Post bookmarked successfully' });
        } else {
            res.status(400).json({ message: 'Post already bookmarked' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/unbookmark_post/:post_id', authenticateUser, async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const post = await Post.findOne({ post_id: post_id });
        const user = await User.findOne({ username: req.user.username });

        if (!post || !user) {
            return res.status(404).json({ message: 'Post or user not found' });
        }

        if (user.bookmarked_posts.includes(post._id)) {
            user.bookmarked_posts.pull(post._id);
            post.bookmark_count -= 1; // Decrement bookmark count
            await user.save();
            await post.save();

            res.status(200).json({ message: 'Post unbookmarked successfully' });
        } else {
            res.status(400).json({ message: 'Post not bookmarked' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
