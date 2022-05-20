require('dotenv').config();
const aws = require('aws-sdk');
const ResponseTransformer = require('./response');

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

const getDefaultLeaveHours = (start, end, restStart, restEnd) => {
  let leaveHours = 0;
  const startMin = timeStringToMinutes(start);
  const endMin = timeStringToMinutes(end);
  const restStartMin = timeStringToMinutes(restStart);
  const restEndMin = timeStringToMinutes(restEnd);

  const minToHours = (min) => Math.ceil(min / 60);

  if (startMin < restStartMin && endMin > restEndMin) { // 正常情況 start && end 都不在Rest範圍
    leaveHours = minToHours(restStartMin - startMin + endMin - restEndMin);
  } else if (startMin >= restEndMin || endMin <= restStartMin) { // 沒有重疊到Rest
    leaveHours = minToHours(endMin - startMin);
  } else if (startMin <= restStartMin && endMin < restEndMin) { // end 在 Rest中
    leaveHours = minToHours(restStartMin - startMin);
  } else if (startMin >= restStartMin && endMin <= restEndMin) { // start end 皆落在Rest範圍
    leaveHours = 0;
  } else if (startMin >= restStartMin && endMin > restEndMin) { // start 在Rest中
    leaveHours = minToHours(endMin - restEndMin);
  }
  return leaveHours;
};

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

const authentication = (needStaff = 0) => function (req, res, next) {
  const { user } = req.session;
  if (!user) {
    const { response, httpCode } = new ResponseTransformer({ errCode: 3441 });
    return res.status(httpCode).json(
      { code: response.code, error: response.error, data: response.data },
    );
  }

  // staff use
  if (needStaff === 1) {
    if (!user.staff_id) {
      const { response, httpCode } = new ResponseTransformer({ errCode: 3442 });
      return res.status(httpCode).json(
        { code: response.code, error: response.error, data: response.data },
      );
    }
    return next();
  }
  // all can use
  return next();
};

module.exports = {
  wrapAsync,
  timeStringToMinutes,
  minutesToTimeString,
  getCeilHourTime,
  getDefaultLeaveHours,
  minToFloorHourTime,
  authentication,
  getS3Url,
  s3,
};
