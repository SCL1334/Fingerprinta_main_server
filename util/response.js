// X0XX Normal Read
// X1XX Normal Create
// X2XX Normal Update
// X3XX Normal Delete
// X4XX User
// X5XX Sensor interaction

const response = {
  1000: {
    status: 'success',
    http: 200,
    eMessage: 'Read successfully',
  },
  1100: {
    status: 'success',
    http: 200,
    eMessage: 'Create successfully',
  },
  1101: {
    status: 'success',
    http: 200,
    eMessage: 'File upload successfully',
  },
  1200: {
    status: 'success',
    http: 200,
    eMessage: 'Edit successfully',
  },
  1300: {
    status: 'success',
    http: 200,
    eMessage: 'Delete successfully',
  },
  1301: {
    status: 'success',
    http: 200,
    eMessage: 'Data initiate successfully',
  },
  1302: {
    status: 'success',
    http: 200,
    eMessage: 'Multi Data initiate successfully',
  },
  1303: {
    status: 'success',
    http: 200,
    eMessage: 'DB table initiate successfully',
  },
  1401: {
    status: 'success',
    http: 200,
    eMessage: 'User sign in successfully',
  },
  1420: {
    status: 'success',
    http: 200,
    eMessage: 'User change password successfully',
  },
  1421: {
    status: 'success',
    http: 200,
    eMessage: 'User apply resetting password url successfully',
  },
  1422: {
    status: 'success',
    http: 200,
    eMessage: 'User reset password successfully',
  },
  1431: {
    status: 'success',
    http: 200,
    eMessage: 'User sign out successfully',
  },

  1501: {
    status: 'success',
    http: 200,
    eMessage: 'Sensor turn on identify mode',
  },
  1502: {
    status: 'success',
    http: 200,
    eMessage: 'Sensor switch to standby mode successfully',
  },
  1510: {
    status: 'success',
    http: 200,
    eMessage: 'Sensor enroll fingerprint successfully',
  },
  1530: {
    status: 'success',
    http: 200,
    eMessage: 'Sensor delete one fingerprint successfully',
  },
  1531: {
    status: 'success',
    http: 200,
    eMessage: 'Sensor delete multi fingerprint successfully',
  },

  2000: {
    status: 'error',
    http: 500,
    eMessage: 'Read failed, internal server error',
  },
  2100: {
    status: 'error',
    http: 500,
    eMessage: 'Create failed, internal server error',
  },
  2101: {
    status: 'error',
    http: 500,
    eMessage: 'File upload failed, internal server error',
  },
  2200: {
    status: 'error',
    http: 500,
    eMessage: 'Edit failed, internal server error',
  },
  2300: {
    status: 'error',
    http: 500,
    eMessage: 'Delete failed, internal server error',
  },
  2401: {
    statu: 'error',
    http: 500,
    eMessage: 'User sign in failed, internal server error',
  },
  2420: {
    status: 'error',
    http: 500,
    eMessage: 'User change password failed, internal server error',
  },
  2421: {
    status: 'error',
    http: 500,
    eMessage: 'User apply resetting password url failed, internal server error',
  },
  2422: {
    status: 'error',
    http: 500,
    eMessage: 'User reset password failed, internal server error',
  },
  2431: {
    status: 'error',
    http: 500,
    eMessage: 'Something went wrong when user sign out',
  },
  2501: {
    status: 'error',
    http: 500,
    eMessage: 'Sensor turn on identify mode failed',
  },
  2502: {
    status: 'success',
    http: 500,
    eMessage: 'Sensor switch to standby mode failed',
  },
  2510: {
    status: 'success',
    http: 500,
    eMessage: 'Sensor enroll fingerprint failed',
  },
  2530: {
    status: 'error',
    http: 500,
    eMessage: 'Delete failed, sensor server error',
  },

  3100: { // mysql errno 1062
    status: 'error',
    http: 400,
    eMessage: 'Create failed, duplicate entry key',
  },
  3101: {
    status: 'error',
    http: 400, // mysql errno 1048
    emessage: 'Create failed, lack of input (Something could not be null)',
  },

  3200: {
    status: 'error',
    http: 400,
    eMessage: 'Edit failed, could not find target',
  },
  3202: {
    status: 'error',
    http: 400, // mysql errno 1451
    eMessage: 'Cannot update a parent row: a foreign key constraint fails',
  },
  3300: {
    status: 'error',
    http: 400,
    eMessage: 'Delete failed, could not find target',
  },
  3302: {
    status: 'error',
    http: 400, // mysql errno 1451
    eMessage: 'Cannot delete a parent row: a foreign key constraint fails',
  },
  3401: {
    status: 'error',
    http: 400,
    eMessage: 'User sign in failed, account or password not match',
  },
  3420: {
    status: 'error',
    http: 400,
    eMessage: 'User change password failed, password incorrect',
  },
  3421: {
    status: 'error',
    http: 400,
    eMessage: 'User apply resetting password url failed, account not exist',
  },
  3422: {
    status: 'error',
    http: 400,
    eMessage: 'User reset password failed, applyment expired or not exist',
  },
  3441: {
    status: 'error',
    http: 401,
    eMessage: 'Unauthorized',
  },
  3442: {
    status: 'error',
    http: 403,
    eMessage: 'Forbidden',
  },
  4411: {
    status: 'error',
    http: 400,
    eMessage: 'student has registered fingerprint',
  },
  4431: {
    status: 'error',
    http: 400,
    eMessage: 'User could not delete self account',
  },
  4143: {
    status: 'error',
    http: 400,
    eMessage: 'finger Id out of range',
  },
  4144: {
    status: 'error',
    http: 400,
    eMessage: 'All fingerprint ID has been used OR table has not been init',
  },
};

module.exports = response;
