const axios = require('axios');
const { promisePool } = require('./mysqlcon');

const { FINGERPRINT_HOST, FINGERPRINT_PORT, SENSOR_API_VERISON } = process.env;
const sensorFingerUrl = `http://${FINGERPRINT_HOST}:${FINGERPRINT_PORT}/api/${SENSOR_API_VERISON}/fingerprints`;
const Logger = require('../util/logger');

const enrollFingerprint = async (fingerId) => {
  // fingerprint ID from 0 to 199
  try {
    const sensorRes = await axios
      .post(`${sensorFingerUrl}/${fingerId}`);

    const sensorResult = sensorRes.data;
    const statusCode = sensorResult.code;
    if (statusCode) {
      // success
      if (statusCode === 1001) { return { code: 1010 }; }
      // operation error
      if (statusCode > 3000) { return { code: statusCode, message: sensorResult.error.message }; }
      // sensor server error
      if (statusCode === 2001) { return { code: 3000 }; }
      // unexpected error
      return { code: 2011, message: 'Sensor internal error' };
    }
    throw new Error('unexpeted server Error: no sensor status');
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const recordMatch = async (studentId, fingerId) => {
  try {
    await promisePool.query('UPDATE fingerprint SET status = 1, student_id = ? WHERE id = ?', [studentId, fingerId]);
    return { code: 1010 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const turnOnIdentify = async () => {
  try {
    const sensorRes = await axios.post(`http://${FINGERPRINT_HOST}:${FINGERPRINT_PORT}/identify`);
    const sensorResult = sensorRes.data;
    if (sensorResult) {
      return { code: 1010 };
    }
    return { code: 2010 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const stopSensor = async () => {
  try {
    const sensorRes = await axios.post(`http://${FINGERPRINT_HOST}:${FINGERPRINT_PORT}/turnoff`);
    const sensorResult = sensorRes.data;
    if (sensorResult) {
      return { code: 1010 };
    }
    return { code: 3010 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const deleteOneSensorFinger = async (fingerId) => {
  try {
    const sensorRes = await axios
      .delete(`${sensorFingerUrl}/${fingerId}`);
    const sensorResult = sensorRes.data;
    const statusCode = sensorResult.code;
    if (statusCode < 2000) { return { code: 1030 }; }
    return { code: 2030 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2030 };
  }
};

const deleteSensorFingerList = async (fingerIdList) => {
  try {
    const sensorRes = await axios(`${sensorFingerUrl}`, {
      method: 'DELETE',
      data: {
        list: fingerIdList,
      },
      headers: {
        'content-type': 'application/json',
      },
    });
    const sensorResult = sensorRes.data;
    const statusCode = sensorResult.code;
    if (statusCode < 2000) { return { code: 1030 }; }
    return { code: 2030 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2030 };
  }
};

const getFingerListOfClass = async (classId) => {
  try {
    const [fingerList] = await promisePool.query(`
    SELECT id FROM fingerprint 
    WHERE student_id 
    IN ( SELECT id FROM student WHERE class_id = ?)
    ORDER BY id ASC;
    `, [classId]);
    return fingerList;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const getFingerQuota = async () => {
  try {
    const [fingerQuotas] = await promisePool.query('SELECT * FROM fingerprint');
    return fingerQuotas;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const initOneRow = async (fingerId) => {
  try {
    await promisePool.query('UPDATE fingerprint SET student_id = null, status = 0 WHERE id = ?', [fingerId]);
    return { code: 1030 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2030 };
  }
};

const initByClass = async (classId) => {
  try {
    await promisePool.query(`
    UPDATE fingerprint 
    SET student_id = null, status = 0 
    WHERE student_id IN
    (SELECT id FROM student WHERE class_id = ?)
    `, [classId]);
    return { code: 1030 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2030 };
  }
};

const findStudent = async (fingerId) => {
  try {
    const [students] = await promisePool.query('SELECT * FROM fingerprint WHERE id = ?', [fingerId]);
    return students;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const checkStudentEnroll = async (studentId) => {
  try {
    const [students] = await promisePool.query('SELECT * FROM fingerprint WHERE student_id = ?', [studentId]);
    return students;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const initTable = async () => {
  // sensor fingerprint id from 0 to 199
  try {
    await promisePool.query(`
      DROP PROCEDURE IF EXISTS proc_initData;
      DELIMITER $
      CREATE PROCEDURE proc_initData()
      BEGIN
          DECLARE i INT DEFAULT 0;
          WHILE i<=199 DO
              INSERT INTO fingerprint(id) VALUES(i);
              SET i = i+1;
          END WHILE;
      END $
      CALL proc_initData();
    `);
    return { code: 1010 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const getAvailableId = async () => {
  try {
    const [fingerIds] = await promisePool.query('SELECT id FROM fingerprint WHERE status = 0');
    return fingerIds;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

module.exports = {
  getFingerQuota,
  turnOnIdentify,
  stopSensor,
  deleteOneSensorFinger,
  deleteSensorFingerList,
  getFingerListOfClass,
  enrollFingerprint,
  recordMatch,
  initOneRow,
  initByClass,
  findStudent,
  initTable,
  checkStudentEnroll,
  getAvailableId,
};
