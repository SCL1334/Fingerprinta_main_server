require('dotenv').config();
const bcrypt = require('bcrypt');

const salt = parseInt(process.env.BCRYPT_SALT);
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

module.exports = { createAccount };
