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

module.exports = { createAccount, signIn };
