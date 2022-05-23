require('dotenv').config();
const aws = require('aws-sdk');
const Logger = require('./logger');

const {
  AWS_RESION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET,
} = process.env;

const s3 = new aws.S3({
  region: AWS_RESION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const getS3Url = async (targetPathName) => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: targetPathName,
    Expires: 60, // second
    ContentType: 'image/jpeg',
  };
  // apply to s3 and get url
  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    return uploadURL;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

module.exports = { s3, getS3Url };
