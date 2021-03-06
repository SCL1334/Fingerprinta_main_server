const argon2 = require('argon2');
const objectHash = require('object-hash');

const resetExpire = parseInt(process.env.RESET_EXPIRE, 10);
const { promisePool } = require('./mysqlcon');
const Cache = require('../util/cache');
const Logger = require('../util/logger');
const { GeneralError } = require('../util/custom_error');

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
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1452 || errno === 1062 || errno === 1264) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

// create a list of students
const createClassStudents = async (students, classId) => {
  const getHashPassword = async (password) => {
    try {
      const hash = await argon2.hash(password);
      return hash;
    } catch (error) {
      return new GeneralError(2001, error.message);
    }
  };

  const transferStudentsPassword = async (index, originalStudents) => {
    if (index === originalStudents.length) { return originalStudents; }
    const newStudents = JSON.parse(JSON.stringify(originalStudents));
    const hash = await getHashPassword(newStudents[index].password);
    if (hash instanceof Error) { return hash; }
    newStudents[index].password = hash;
    return transferStudentsPassword(index + 1, newStudents);
  };

  const processedStudents = await transferStudentsPassword(0, students);
  if (processedStudents instanceof Error) { return { code: 2010 }; }

  try {
    const studentAccounts = Object.keys(processedStudents).reduce((acc, cur) => {
      acc.push([
        processedStudents[cur].name,
        processedStudents[cur].email,
        processedStudents[cur].password,
        classId,
      ]);
      return acc;
    }, []);
    await promisePool.query('INSERT INTO student (name, email, password, class_id) VALUES ?', [studentAccounts]);

    return { code: 1010 };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
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
      new Logger('target not exist').error();
      return { code: 4020 };
    }
    await promisePool.query('UPDATE student SET ? , last_update = CURRENT_TIMESTAMP WHERE id = ?', [student, studentId]);
    return { code: 1020 };
  } catch (error) {
    new Logger(error).error();
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
  } catch (error) {
    new Logger(error).error();
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
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const deleteStudent = async (studentId) => {
  // delete success:1  fail case: server 0 / foreign key constraint -1
  try {
    const [result] = await promisePool.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      Logger.error('student not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM student WHERE id = ?', [studentId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
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
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
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
  } catch (error) {
    new Logger(error).error();
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
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const deleteStaff = async (staffId) => {
  // delete success:1  fail case: server 0 / foreign key constraint -1
  try {
    const [result] = await promisePool.query('SELECT id FROM staff WHERE id = ?', [staffId]);
    if (result.length === 0) {
      Logger.error('student not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM staff WHERE id = ?', [staffId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
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
  } catch (error) {
    new Logger(error).error();
    return { code: 2010, message: 'Internal server error' };
  }
};

const changePassword = async (role, id, password, newPassword) => {
  try {
    const [users] = await promisePool.query(`SELECT email, password FROM ${role} WHERE id = ?`, [id]);
    if (users.length === 1) {
      const match = await argon2.verify(users[0].password, password);
      if (match) {
        const hashedPassword = await argon2.hash(newPassword);
        await promisePool.query(`UPDATE ${role} SET password = ?, password_default = 0 WHERE id = ?`, [hashedPassword, id]);
        return { code: 1020 };
      }
    }
    return { code: 4029 };
  } catch (error) {
    new Logger(error).error();
    return { code: 2020 };
  }
};

const setHashedMail = async (email) => {
  if (!Cache.ready) {
    Logger.error('Redis is not ready');
    return { code: 2050 };
  }
  try {
    const hash = await objectHash(email);
    await Cache.v4.set(hash, email, { EX: resetExpire, NX: true });
    return { code: 1010, data: { hash } };
  } catch (error) {
    new Logger(error).error();
    return { code: 2010 };
  }
};

const getMailByHash = async (hash) => {
  if (!Cache.ready) {
    Logger.error('Redis is not ready');
    return { code: 2050 };
  }
  try {
    const email = await Cache.v4.get(hash);
    await Cache.v4.del(hash);
    return { code: 1000, data: { email } };
  } catch (error) {
    new Logger(error).error();
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
  } catch (error) {
    new Logger(error).error();
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
  } catch (error) {
    new Logger(error).error();
    return { code: 2010, message: 'Internal server error' };
  }
};

const getStudentProfile = async (email) => {
  try {
    const [profiles] = await promisePool.query(`
      SELECT u.id, u.name, u.email, c.batch, cg.name as class_group_name, ct.name as class_type_name 
      FROM student as u 
      LEFT OUTER JOIN class as c ON u.class_id = c.id 
      LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
      LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id 
      WHERE u.email = ?;
      `, [email]);
    const profile = profiles[0];
    return profile;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const getStaffProfile = async (email) => {
  try {
    const [profiles] = await promisePool.query('SELECT id, name, email FROM staff WHERE email = ?;', [email]);
    const profile = profiles[0];
    return profile;
  } catch (error) {
    new Logger(error).error();
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
      new Logger('student not exist').error();
      return { code: 4020 };
    }
    await conn.query('UPDATE student SET finger_id = ? WHERE id = ?', [fingerId, studentId]);
    await conn.query('COMMIT');
    return { code: 1020, finger_id: fingerId };
  } catch (error) {
    await conn.query('ROLLBACK');
    new Logger(error).error();
    return { code: 2020 };
  } finally {
    await conn.release();
  }
};

const findByFinger = async (fingerId) => {
  try {
    const [students] = await promisePool.query('SELECT student_id FROM fingerprint WHERE id = ?', [fingerId]);
    if (students.length === 0) {
      new Logger('student not exist').error();
      return -1;
    }
    return students[0].student_id;
  } catch (error) {
    new Logger(error).error();
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
