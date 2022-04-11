require('dotenv').config();
const axios = require('axios');

const { FINGERPRINT_HOST, SENSOR_API_VERISON } = process.env;

const getEnrollId = async () => {
  // fingerprint ID from 0 to 199
  try {
    const sensorRes = await axios
      .get(`${FINGERPRINT_HOST}/api/${SENSOR_API_VERISON}/fingerId`);
    const enrollId = sensorRes.data.data;
    return enrollId;
  } catch (err) {
    console.log(err);
    return -2;
  }
};

module.exports = { getEnrollId };
