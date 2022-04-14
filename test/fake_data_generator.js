require('dotenv').config();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('../models/mysqlcon');

// name, email, password, class_id, finger_id
const createFakeUser = async (num, roleId, classId = null) => {
  try {
    const role = { 1: 'student', 2: 'teacher' };
    const password = 'test';
    // gen fake data
    const users = [];
    for (let i = 0; i < num; i += 1) {
      const name = `test_${role[roleId]}_${i + 1}`;
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
// createFakeUser(15, 1, 1);
// gen 5 teacher
// createFakeUser(5, 2);

const truncatePunch = async () => {
  await promisePool.query('TRUNCATE student_punch;');
  console.log('completed');
};

// student_id, punch_in, punch_out
const createFakePunch = async (days) => {
  try {
    await truncatePunch();
    const today = dayjs().format('YYYY-MM-DD');
    const punchInInit = dayjs(`${today} 09:00:00`);
    const punchOutInit = dayjs(`${today} 18:00:00`);
    const [students] = await promisePool.query('SELECT id FROM student');
    const randomMin = () => Math.floor(Math.random() * 60) - 30;
    const attendance = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const punchInDate = punchInInit.subtract(i, 'day');
      const punchOutDate = punchOutInit.subtract(i, 'day');
      students.forEach((student) => {
        const punchIn = punchInDate.add(randomMin(), 'minute');
        const punchOut = punchOutDate.add(randomMin(), 'minute');
        attendance.push([student.id, punchIn.format(), punchOut.format()]);
      });
    }
    console.log(attendance);
    await promisePool.query('INSERT INTO student_punch (student_id, punch_in, punch_out) VALUES ?', [attendance]);
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// each student punch in past 30 days
createFakePunch(30);
