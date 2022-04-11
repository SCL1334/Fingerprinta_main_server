require('dotenv').config();
const bcrypt = require('bcrypt');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('./mysqlcon');

const createAccount = async (name, account, password, classId, roleId) => {
  // Admin: 0, Teacher: 1, Student:2
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      name,
      account,
      password: hashedPassword,
      class_id: classId,
      role: roleId,
    };
    const [result] = await promisePool.query('INSERT INTO user SET ?', user);
    return result.insertId;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return -1;
    }
    return 0;
  }
};

const signIn = async (account, password) => {
  try {
    const [users] = await promisePool.query('SELECT account, password FROM user WHERE account = ?', [account]);
    if (users.length === 1) {
      const match = await bcrypt.compare(password, users[0].password);
      if (match) return 1;
    }
    return -1;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

const matchFingerprint = async (userId, fingerId) => {
  const conn = await promisePool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [result] = await conn.query('SELECT id FROM user WHERE id = ?', [userId]);
    if (result.length === 0) {
      console.log('user not exist');
      return -1;
    }
    await conn.query('UPDATE user SET finger_id = ? WHERE id = ?', [fingerId, userId]);
    await conn.query('COMMIT');
    return 1;
  } catch (err) {
    await conn.query('ROLLBACK');
    console.log(err);
    return 0;
  } finally {
    await conn.release();
  }
};

module.exports = { createAccount, signIn, matchFingerprint };
