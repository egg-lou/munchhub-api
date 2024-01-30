const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const authenticateUser = require('../middlewares/authenticateUser');
const multer = require('multer');
const sharp = require('sharp');
const s3 = require('../config/aws');
const multerConfig = require('../config/multer');

router.post(
    '/:post_id/add_comment',
    authenticateUser,
    multerConfig.single('image'),
    async (req, res) => {
        try {
            const { post_id } = req.params;
            const { content } = req.body;

            const post = await Post.findOne({ post_id: post_id });

            if (!post) {
                return res.status(404).json({
                    message: 'Post not found',
                });
            }

            if (!content) {
                return res.status(400).json({
                    message: 'Comment Content is Required!',
                });
            }

            let commentImage = null;

            if (req.file) {
                const customFilename = `${post_id}_${Date.now()}.jpg`;

                const resizedImageBuffer = await sharp(req.file.buffer)
                    .resize({ width: 2000, height: 2000, fit: 'inside' })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const s3UploadResponse = await s3
                    .upload({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: `comment_images/${customFilename}`,
                        Body: resizedImageBuffer,
                        ContentType: req.file.mimetype,
                    })
                    .promise();

                commentImage = s3UploadResponse.Location;
            }

            const comment = new Comment({
                comment: content,
                comment_author: req.user.username,
                comment_image_url: commentImage,
            });

            post.comments.push(comment);

            await post.save();
            await comment.save();

            res.status(201).json({
                message: 'Comment Created Successfully!',
                comment: comment,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        }
    }
);

module.exports = router;
