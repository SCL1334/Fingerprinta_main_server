require('dotenv').config();

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => function (req, res, next) {
  // Make sure to `.catch()` any errors and pass them along to the `next()`
  // middleware in the chain, in this case the error handler.
  fn(req, res, next).catch(next);
};

const timeStringToMinutes = (timeString) => {
  try {
    const time = timeString.split(':');
    const minutes = parseInt(time[0], 10) * 60 + parseInt(time[1], 10);
    return minutes;
  } catch {
    return null;
  }
};

module.exports = {
  wrapAsync, timeStringToMinutes,
};
