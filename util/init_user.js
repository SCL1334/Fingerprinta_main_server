const argon2 = require('argon2');
const { promisePool } = require('../models/mysqlcon');

const initUser = { name: 'admin', email: 'admin@init.com', password: 'test' };
const createAdmin = async (user) => {
  try {
    const hashPassword = await argon2.hash(user.password);
    await promisePool.query('INSERT INTO staff (name, email, password) VALUES ?', [[[user.name, user.email, hashPassword]]]);
    console.log('Creating user completed');
  } catch (err) {
    console.log(err);
    console.log('Creating user failed');
  }
};

createAdmin(initUser);
