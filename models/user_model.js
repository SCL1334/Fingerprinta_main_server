const argon2 = require('argon2');

const resetExpire = parseInt(process.env.RESET_EXPIRE, 10);
const { promisePool } = require('./mysqlcon');
const Cache = require('../util/cache');

// account manage
const createStudent = async (name, email, password, classId) => {
  try {
    const hashedPassword = await argon2.hash(password);
    const student = {
      name,
      email,
      password: hashedPassword,
      class_id: classId,
    };
    const [result] = await promisePool.query('INSERT INTO student SET ?', student);
    return { code: 1010, insert_id: result.insertId };
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

// create a list of students
const createClassStudents = async (students, classId) => {
  // students [{name, email, birth}, ... , ...]
  try {
    const forEachAsync = async (array, callback) => {
      for (let i = 0; i < array.length; i += 1) {
        await callback(array[i]);
      }
    };

    await forEachAsync(students, async (student) => {
      student.password = await argon2.hash(student.birth);
      delete student.birth;
    });

    const studentAccounts = Object.keys(students).reduce((acc, cur) => {
      acc.push([students[cur].name, students[cur].email, students[cur].password, classId]);
      return acc;
    }, []);

    await promisePool.query('INSERT INTO student (name, email, password, class_id) VALUES ?', [studentAccounts]);

    return { code: 1010 };
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const editStudent = async (studentId, student) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      console.log('target not exist');
      return { code: 4020 };
    }
    await promisePool.query('UPDATE student SET ? , last_update = CURRENT_TIMESTAMP WHERE id = ?', [student, studentId]);
    return { code: 1020 };
  } catch (error) {
    console.log(error);
    return { code: 2020 };
  }
};

const getStudents = async (classId = null) => {
  // need to do paging optimization later
  try {
    const sqlFilter = (classId) ? ' WHERE class_id = ?' : '';
    const [students] = await promisePool.query(`
    SELECT s.id, s.name, s.email, s.class_id, f.id AS finger_id, c.batch, cg.name AS class_group_name, ct.name AS class_type_name 
    FROM student AS s
    LEFT OUTER JOIN fingerprint AS f  ON s.id = f.student_id
    LEFT OUTER JOIN class AS c ON s.class_id = c.id
    LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
    LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
    ${sqlFilter}`, [classId]);
    return students;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getOneStudent = async (studentId) => {
  try {
    const [profilesBasic] = await promisePool.query(`
      SELECT s.id, s.name, s.email, s.class_id, f.id AS finger_id, c.batch, cg.name AS class_group_name, ct.name AS class_type_name 
      FROM student AS s
      LEFT OUTER JOIN fingerprint AS f  ON s.id = f.student_id
      LEFT OUTER JOIN class AS c ON s.class_id = c.id
      LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
      LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
      WHERE s.id = ?
      `, [studentId]);
    const profileBasic = profilesBasic[0];

    return profileBasic;
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
  try {
    const hashedPassword = await argon2.hash(password);
    const staff = {
      name,
      email,
      password: hashedPassword,
    };
    const [result] = await promisePool.query('INSERT INTO staff SET ?', staff);
    return { code: 1010, insert_id: result.insertId };
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return { code: 3010 };
    }
    return { code: 2010 };
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

const getClassTeachers = async (classId) => {
  try {
    const [teachers] = await promisePool.query(`
    SELECT id, name, email 
    FROM staff 
    WHERE id IN 
    (SELECT teacher_id FROM class_teacher WHERE class_id = ?);
    `, [classId]);
    return teachers;
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
    const [students] = await promisePool.query('SELECT id, email, password FROM student WHERE email = ?', [email]);
    if (students.length === 1) {
      const match = await argon2.verify(students[0].password, password);
      if (match) return { code: 1010, student_id: students[0].id };
    }
    return { code: 4010, message: 'email or password not match' };
  } catch (err) {
    console.log(err);
    return { code: 2010, message: 'Internal server error' };
  }
};

const changePassword = async (role, email, password, newPassword) => {
  try {
    const [users] = await promisePool.query(`SELECT email, password FROM ${role} WHERE email = ?`, [email]);
    if (users.length === 1) {
      const match = await argon2.compare(password, users[0].password);
      if (match) {
        const hashedPassword = await argon2.hash(newPassword, salt);
        await promisePool.query(`UPDATE ${role} SET password = ?, password_default = 0 WHERE email = ?`, [hashedPassword, email]);
        return { code: 1020 };
      }
    }
    return { code: 4029 };
  } catch (err) {
    console.log(err);
    return { code: 2020 };
  }
};

const setHashedMail = async (email) => {
  if (!Cache.ready) {
    console.log('Redis is not ready');
    return { code: 2050 };
  }
  try {
    const hash = await argon2.hash(email);
    await Cache.set(hash, email, { EX: resetExpire, NX: true });
    return { code: 1010, data: { hash } };
  } catch (err) {
    console.log(err);
    return { code: 2010 };
  }
};

const getMailByHash = async (hash) => {
  if (!Cache.ready) {
    console.log('Redis is not ready');
    return { code: 2050 };
  }
  try {
    const email = await Cache.get(hash);
    await Cache.del(hash);
    return { code: 1000, data: { email } };
  } catch (err) {
    console.log(err);
    return { code: 2000 };
  }
};

const resetPassword = async (role, email, newPassword) => {
  try {
    const [users] = await promisePool.query(`SELECT email, password FROM ${role} WHERE email = ?`, [email]);
    if (users.length === 1) {
      const hashedPassword = await argon2.hash(newPassword);
      await promisePool.query(`UPDATE ${role} SET password = ? , password_default = 0 WHERE email = ?`, [hashedPassword, email]);
      return { code: 1020 };
    }
    return { code: 4029 };
  } catch (err) {
    console.log(err);
    return { code: 2020 };
  }
};

const staffSignIn = async (email, password) => {
  try {
    const [staffs] = await promisePool.query('SELECT id, email, password FROM staff WHERE email = ?', [email]);
    if (staffs.length === 1) {
      const match = await argon2.verify(staffs[0].password, password);
      if (match) return { code: 1010, staff_id: staffs[0].id };
    }
    return { code: 4010, message: 'email or password not match' };
  } catch (err) {
    console.log(err);
    return { code: 2010, message: 'Internal server error' };
  }
};

const getStudentProfile = async (studentId) => {
  try {
    const [profiles] = await promisePool.query(`
      SELECT u.id, u.name, u.email, c.batch, cg.name as class_group_name, ct.name as class_type_name 
      FROM student as u 
      LEFT OUTER JOIN class as c ON u.class_id = c.id 
      LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
      LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id 
      WHERE u.id = ?;
      `, [studentId]);
    const profile = profiles[0];
    return profile;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getStaffProfile = async (staffId) => {
  try {
    const [profiles] = await promisePool.query('SELECT id, name, email FROM staff WHERE id = ?;', [staffId]);
    const profile = profiles[0];
    // no need to check staff classes currently
    // const [classes] = await promisePool.query('SELECT class_id FROM class_teacher WHERE teacher_id = ?', [profile.id]);
    // profile.classes = classes;
    return profile;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// not use after adding fingerprint table
const matchFingerprint = async (studentId, fingerId) => {
  const conn = await promisePool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [result] = await conn.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      console.log('student not exist');
      return { code: 4020 };
    }
    await conn.query('UPDATE student SET finger_id = ? WHERE id = ?', [fingerId, studentId]);
    await conn.query('COMMIT');
    return { code: 1020, finger_id: fingerId };
  } catch (err) {
    await conn.query('ROLLBACK');
    console.log(err);
    return { code: 2020 };
  } finally {
    await conn.release();
  }
};

const findByFinger = async (fingerId) => {
  try {
    const [students] = await promisePool.query('SELECT student_id FROM fingerprint WHERE id = ?', [fingerId]);
    if (students.length === 0) {
      console.log('student not exist');
      return -1;
    }
    return students[0].student_id;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

module.exports = {
  createStudent,
  createClassStudents,
  editStudent,
  getStudents,
  getOneStudent,
  deleteStudent,
  createStaff,
  getStaffs,
  getClassTeachers,
  deleteStaff,
  studentSignIn,
  changePassword,
  resetPassword,
  setHashedMail,
  getMailByHash,
  staffSignIn,
  getStudentProfile,
  getStaffProfile,
  matchFingerprint,
  findByFinger,
};
