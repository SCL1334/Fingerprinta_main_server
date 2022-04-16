require('dotenv').config();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('../models/mysqlcon');

const truncateTable = async (tableName) => {
  await promisePool.query(`TRUNCATE ${tableName};`);
  console.log('truncated');
};

// name, email, password, class_id, finger_id
const createFakeUser = async (roleId, startId, num, classId = null) => {
  try {
    const role = { 1: 'student', 2: 'teacher' };
    const password = 'test';
    // gen fake data
    const users = [];
    for (let i = startId; i < startId + num; i += 1) {
      const name = `test_${role[roleId]}_${i}`;
      const email = `${name}@test.com`;
      const hashedPassword = await bcrypt.hash(password, salt);
      if (classId) {
        users.push([name, email, hashedPassword, classId]);
      } else if (classId === null) {
        users.push([name, email, hashedPassword]);
      }
    }
    // save fake data
    if (roleId === 1) {
      await promisePool.query('INSERT INTO student (name, email, password, class_id) VALUES ?', [users]);
    } else if (roleId === 2) {
      await promisePool.query('INSERT INTO staff (name, email, password) VALUES ?', [users]);
    }
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// 1: 'student', 2: 'teacher'
// gen 15 students first, same class
// createFakeUser(1, 16, 15, 1);
// gen 5 teacher
// createFakeUser(2, 1, 5);

// student_id, punch_in, punch_out
const createFakePunch = async (days) => {
  try {
    await truncateTable('student_punch');
    const today = dayjs();
    const punchInInit = dayjs(`${today.format('YYYY-MM-DD')} 09:00:00`);
    const punchOutInit = dayjs(`${today.format('YYYY-MM-DD')} 18:00:00`);
    const [students] = await promisePool.query('SELECT id FROM student');
    const randomMin = () => Math.floor(Math.random() * 60) - 30;
    const attendance = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const punchDate = today.subtract(i, 'day');
      students.forEach((student) => {
        const punchIn = punchInInit.add(randomMin(), 'minute');
        const punchOut = punchOutInit.add(randomMin(), 'minute');
        attendance.push([student.id, punchDate.format('YYYY-MM-DD'), punchIn.format('HH:mm:ss'), punchOut.format('HH:mm:ss')]);
      });
    }
    console.log(attendance);
    await promisePool.query('INSERT INTO student_punch (student_id, punch_date, punch_in, punch_out) VALUES ?', [attendance]);
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// each student punch in past 30 days
// createFakePunch(30);

const createLeaveTypes = async () => {
  try {
    await truncateTable('leave_type');
    const leaveTypes = [['personal'], ['sick']];
    await promisePool.query('INSERT INTO leave_type (name) VALUES ?', [leaveTypes]);
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

const createFakeLeaveApplications = async (days, rate) => {
  try {
    await truncateTable('student_leave');
    const today = dayjs();
    const startInit = dayjs(`${today.format('YYYY-MM-DD')} 09:00:00`);
    const endInit = dayjs(`${today.format('YYYY-MM-DD')} 18:00:00`);
    const [students] = await promisePool.query('SELECT id FROM student');
    const [types] = await promisePool.query('SELECT id FROM leave_type');
    const random = (num) => Math.floor(Math.random() * num);
    const randomHour = () => Math.floor(Math.random() * 5);
    const description = 'test';
    const applications = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = today.subtract(i, 'day');
      students.forEach((student) => {
        if (random(rate) !== 0) {
          return;
        }
        const start = startInit.add(randomHour(), 'hour');
        const end = endInit.subtract(randomHour(), 'hour');
        const type = types[random(types.length)].id;
        applications.push([student.id, type, description, date.format('YYYY-MM-DD'), start.format('HH:mm:ss'), end.format('HH:mm:ss')]);
      });
    }
    console.log(applications);
    await promisePool.query('INSERT INTO student_leave (student_id, leave_type_id, description, date, start, end) VALUES ?', [applications]);
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// createLeaveTypes();
createFakeLeaveApplications(15, 15);
