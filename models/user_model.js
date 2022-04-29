const bcrypt = require('bcrypt');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('./mysqlcon');

// account manage
const createStudent = async (name, email, password, classId) => {
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
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

const editStudent = async (studentId, student) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM student WHERE id = ?', [studentId]);
    if (result.length === 0) {
      console.log('target not exist');
      return { code: 4020 };
    }
    await promisePool.query('UPDATE student SET ? WHERE id = ?', [student, studentId]);
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
    SELECT s.id, s.name, s.email, s.class_id, s.finger_id, c.batch, cg.name AS class_group_name, ct.name AS class_type_name 
    FROM student AS s
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
      SELECT id, name, class_id FROM student WHERE id = ?
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
    const hashedPassword = await bcrypt.hash(password, salt);
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

const studentChangePassword = async (email, password, newPassword) => {
  try {
    const [students] = await promisePool.query('SELECT email, password FROM student WHERE email = ?', [email]);
    if (students.length === 1) {
      const match = await bcrypt.compare(password, students[0].password);
      if (match) {
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await promisePool.query('UPDATE student SET password = ? WHERE email = ?', [hashedPassword, email]);
        return { code: 1020 };
      }
    }
    return { code: 4029 };
  } catch (err) {
    console.log(err);
    return { code: 2020 };
  }
};

const studentResetPassword = async (email, newPassword) => {
  try {
    const [students] = await promisePool.query('SELECT email, password FROM student WHERE email = ?', [email]);
    if (students.length === 1) {
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await promisePool.query('UPDATE student SET password = ? WHERE email = ?', [hashedPassword, email]);
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
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getStaffProfile = async (email) => {
  try {
    const [profiles] = await promisePool.query('SELECT id, name, email FROM staff WHERE email = ?;', [email]);
    const profile = profiles[0];
    const [classes] = await promisePool.query('SELECT class_id FROM class_teacher WHERE teacher_id = ?', [profile.id]);
    profile.classes = classes;
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
    return students[0].id;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

module.exports = {
  createStudent,
  editStudent,
  getStudents,
  getOneStudent,
  deleteStudent,
  createStaff,
  getStaffs,
  getClassTeachers,
  deleteStaff,
  studentSignIn,
  studentChangePassword,
  studentResetPassword,
  staffSignIn,
  getStudentProfile,
  getStaffProfile,
  matchFingerprint,
  findByFinger,
};
