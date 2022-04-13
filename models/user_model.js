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
    const [result] = await promisePool.query('INSERT INTO usr SET ?', user);
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

const getAccounts = async () => {
  // need to do paging optimization later
  try {
    const [accounts] = await promisePool.query('SELECT id, role, name, account, class_id, finger_id FROM usr');
    return accounts;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const deleteAccount = async (userId) => {
  // delete success:1  fail case: server 0 / foreign key constraint -1
  try {
    const [result] = await promisePool.query('SELECT id FROM usr WHERE id = ?', [userId]);
    if (result.length === 0) {
      console.error('user not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM usr WHERE id = ?', [userId]);
    return 1;
  } catch (error) {
    console.log(error);
    const { errno } = error;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return -1;
    }
    return 0;
  }
};

const signIn = async (account, password) => {
  try {
    const [users] = await promisePool.query('SELECT account, password FROM usr WHERE account = ?', [account]);
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

const getProfile = async (account) => {
  try {
    const [profiles] = await promisePool.query(`
      SELECT u.id, u.role, u.name, u.account, c.batch, cg.name as class_group_name, ct.name as class_type_name FROM usr as u 
      LEFT OUTER JOIN class as c ON u.class_id = c.id 
      LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
      LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id 
      WHERE u.account = ?;
      `, [account]);
    const profile = profiles[0];
    // roleTable 0: 'admin', 1: 'teacher', 2: 'student'
    console.log(profile);
    const { id, role } = profile;

    let actions = {};
    if (role === 2) {
      actions = {
        searchAttendance: `api/1.0/attendances/punches?student_id=${id}`,
        test: '/',
      };
    }
    profile.actions = actions;
    return profile;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const matchFingerprint = async (userId, fingerId) => {
  const conn = await promisePool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [result] = await conn.query('SELECT id FROM usr WHERE id = ?', [userId]);
    if (result.length === 0) {
      console.log('user not exist');
      return -1;
    }
    await conn.query('UPDATE usr SET finger_id = ? WHERE id = ?', [fingerId, userId]);
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

const findByFinger = async (fingerId) => {
  try {
    const [users] = await promisePool.query('SELECT id FROM usr WHERE finger_id = ?', [fingerId]);
    if (users.length === 0) {
      console.log('user not exist');
      return -1;
    }
    return users[0].id;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

module.exports = {
  createAccount, getAccounts, deleteAccount, signIn, getProfile, matchFingerprint, findByFinger,
};
