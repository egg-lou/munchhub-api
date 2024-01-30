const AWS = require('aws-sdk');
const config = require('../config');

AWS.config.update({
    region: config.awsRegion,
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
});

const s3 = new AWS.S3();

module.exports = s3;
