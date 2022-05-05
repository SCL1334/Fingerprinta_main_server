require('dotenv').config();
const aws = require('aws-sdk');
const dayjs = require('dayjs');

const {
  AWS_RESION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET,
} = process.env;

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => function (req, res, next) {
  // Make sure to `.catch()` any errors and pass them along to the `next()`
  // middleware in the chain, in this case the error handler.
  fn(req, res, next).catch(next);
};

const s3 = new aws.S3({
  region: AWS_RESION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const timeStringToMinutes = (timeString) => {
  try {
    const time = timeString.split(':');
    const minutes = parseInt(time[0], 10) * 60 + parseInt(time[1], 10);
    return minutes;
  } catch {
    return null;
  }
};

const minutesToTimeString = (minutes) => {
  const time = `${Math.ceil(minutes / 60)}:00:00`;
  return time;
};

const getCeilHourTime = (timeString) => minutesToTimeString(timeStringToMinutes(timeString));

const minToFloorHourTime = (timeString) => `${Math.floor(timeString / 60)}:00:00`;

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
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = {
  wrapAsync,
  timeStringToMinutes,
  minutesToTimeString,
  getCeilHourTime,
  minToFloorHourTime,
  getS3Url,
};
