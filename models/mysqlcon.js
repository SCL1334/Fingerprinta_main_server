const mysql = require('mysql2');
require('dotenv').config();

// Create db connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: false,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.TIMEZONE,
});

// Create promise connection from connection pool
const promisePool = pool.promise();

module.exports = { promisePool };

// need to rewrite to catch disconnect error
