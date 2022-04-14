require('dotenv').config();
const bcrypt = require('bcrypt');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('./mysqlcon');

// account manage
const createStudent = async (name, email, password, classId) => {
  // Admin: 0, Teacher: 1, Student:2
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = {
      name,
      email,
      password: hashedPassword,
      class_id: classId,
    };
    const [result] = await promisePool.query('INSERT INTO student SET ?', student);
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

const getStudents = async () => {
  // need to do paging optimization later
  try {
    const [students] = await promisePool.query('SELECT id, name, email, class_id, finger_id FROM student');
    return students;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const deleteStudent = async (studentId) => {
  // delete success:1  fail case: server 0 / foreign key constraint -1
  try {
    const [result] = await promisePool.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      console.log('student not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM student WHERE id = ?', [studentId]);
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return -1;
    }
    return 0;
  }
};

const createStaff = async (name, email, password) => {
  // Admin: 0, Teacher: 1, Student:2
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    const staff = {
      name,
      email,
      password: hashedPassword,
    };
    const [result] = await promisePool.query('INSERT INTO staff SET ?', staff);
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

const getStaffs = async () => {
  // need to do paging optimization later
  try {
    const [staffs] = await promisePool.query('SELECT id, name, email FROM staff');
    return staffs;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const deleteStaff = async (staffId) => {
  // delete success:1  fail case: server 0 / foreign key constraint -1
  try {
    const [result] = await promisePool.query('SELECT id FROM staff WHERE id = ?', [staffId]);
    if (result.length === 0) {
      console.log('student not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM staff WHERE id = ?', [staffId]);
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return -1;
    }
    return 0;
  }
};

const studentSignIn = async (email, password) => {
  try {
    const [students] = await promisePool.query('SELECT email, password FROM student WHERE email = ?', [email]);
    if (students.length === 1) {
      const match = await bcrypt.compare(password, students[0].password);
      if (match) return 1;
    }
    return -1;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

const staffSignIn = async (email, password) => {
  try {
    const [staffs] = await promisePool.query('SELECT email, password FROM staff WHERE email = ?', [email]);
    if (staffs.length === 1) {
      const match = await bcrypt.compare(password, staffs[0].password);
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

const matchFingerprint = async (studentId, fingerId) => {
  const conn = await promisePool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [result] = await conn.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      console.log('student not exist');
      return -1;
    }
    await conn.query('UPDATE student SET finger_id = ? WHERE id = ?', [fingerId, studentId]);
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
    const [students] = await promisePool.query('SELECT id FROM student WHERE finger_id = ?', [fingerId]);
    if (students.length === 0) {
      console.log('student not exist');
      return -1;
    }
    return students[0].id;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

module.exports = {
  createStudent,
  getStudents,
  deleteStudent,
  createStaff,
  getStaffs,
  deleteStaff,
  studentSignIn,
  staffSignIn,
  getProfile,
  matchFingerprint,
  findByFinger,
};
