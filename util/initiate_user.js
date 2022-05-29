const argon2 = require('argon2');
const { promisePool } = require('../models/mysqlcon');
const Logger = require('./logger');

const initUser = { name: 'admin', email: 'cde@staff.com', password: 'test' };
const createAdmin = async (user) => {
  try {
    const hashPassword = await argon2.hash(user.password);
    await promisePool.query('INSERT INTO staff (name, email, password) VALUES ?', [[[user.name, user.email, hashPassword]]]);
    new Logger('Creating user completed').info();
  } catch (error) {
    new Logger(error).error();
    new Logger('Creating user failed').error();
  }
};

createAdmin(initUser);
