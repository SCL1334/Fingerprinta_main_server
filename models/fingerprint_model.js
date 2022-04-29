const axios = require('axios');
const { promisePool } = require('./mysqlcon');

const { FINGERPRINT_HOST, SENSOR_API_VERISON } = process.env;
const sensorFingerUrl = `${FINGERPRINT_HOST}/api/${SENSOR_API_VERISON}/fingerprints`;

const enrollId = async (fingerId) => {
  // fingerprint ID from 0 to 199
  try {
    const sensorRes = await axios
      .post(`${sensorFingerUrl}/${fingerId}`);
    const sensorResult = sensorRes.data;
    console.log(sensorResult);
    const statusCode = sensorResult.code;
    if (statusCode) {
      // success
      if (statusCode === 1001) {
        // in this case, Sensor has recorded the finger ID
        // It's better to record the data in db as well to track the sensor status
        await promisePool.query('UPDATE fingerprint SET status = 1 WHERE id = ?', [fingerId]);
        return { code: 1010 };
      }
      // operation error
      if (statusCode > 3000) { return { code: statusCode, message: sensorResult.error.message }; }
      // sensor server error
      if (statusCode === 2001) { return { code: 3000 }; }
      // unexpected error
      return { code: 2011, message: 'Sensor internal error' };
    }
    throw new Error('unexpeted server Error: no sensor status');
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    return null;
  }
};

const matchStudent = async (fingerId, studentId) => {
  try {
    await promisePool.query('UPDATE fingerprint SET student_id = ?, status = 1 WHERE id = ?', [studentId, fingerId]);
    return { code: 1020 };
  } catch (err) {
    console.log(err);
    // mark as abnormal
    await promisePool.query('UPDATE fingerprint SET status = 2 WHERE id = ?', [fingerId]);
    return { code: 2020 };
  }
};

const initOneRow = async (fingerId) => {
  try {
    await promisePool.query('UPDATE fingerprint SET student_id = null, status = 0 WHERE id = ?', [fingerId]);
    return { code: 1030 };
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    return { code: 2030 };
  }
};

const findStudent = async (fingerId) => {
  try {
    const [students] = await promisePool.query('SELECT * FROM fingerprint WHERE id = ?', [fingerId]);
    return students;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const checkStudentEnroll = async (studentId) => {
  try {
    const [students] = await promisePool.query('SELECT * FROM fingerprint WHERE student_id = ?', [studentId]);
    return students;
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    return { code: 2010 };
  }
};

module.exports = {
  enrollId,
  deleteOneSensorFinger,
  deleteSensorFingerList,
  getFingerListOfClass,
  matchStudent,
  initOneRow,
  initByClass,
  findStudent,
  initTable,
  checkStudentEnroll,

};
