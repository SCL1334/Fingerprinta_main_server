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

const minutesToTimeString = (minutes) => {
  const time = `${Math.ceil(minutes / 60)}:00:00`;
  return time;
};

const getCeilHourTime = (timeString) => minutesToTimeString(timeStringToMinutes(timeString));

const minToFloorHourTime = (timeString) => `${Math.floor(timeString / 60)}:00:00`;

module.exports = {
  wrapAsync, timeStringToMinutes, minutesToTimeString, getCeilHourTime, minToFloorHourTime,
};
