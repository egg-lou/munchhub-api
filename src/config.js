require('dotenv').config();
module.exports = {
    mongoUrl: process.env.MONGO_DB,
    jwtSecret: process.env.JWT_SECRET,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    awsBucketName: process.env.AWS_BUCKET_NAME,
    port: process.env.PORT,
};
