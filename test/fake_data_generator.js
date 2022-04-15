require('dotenv').config();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const salt = parseInt(process.env.BCRYPT_SALT, 10);
const { promisePool } = require('../models/mysqlcon');

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

const truncatePunch = async () => {
  await promisePool.query('TRUNCATE student_punch;');
  console.log('completed');
};

// student_id, punch_in, punch_out
const createFakePunch = async (days) => {
  try {
    await truncatePunch();
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
createFakePunch(30);
