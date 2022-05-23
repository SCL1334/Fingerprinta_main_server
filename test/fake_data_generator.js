require('dotenv').config();
const argon2 = require('argon2');
const dayjs = require('dayjs');

const { promisePool } = require('../models/mysqlcon');

const truncateTable = async (tableName) => {
  await promisePool.query(`TRUNCATE ${tableName};`);
  console.log('truncated');
};

const clearStudent = async () => {
  await promisePool.query(`
  SET FOREIGN_KEY_CHECKS = 0; 
  TRUNCATE student;
  TRUNCATE student_leave;
  TRUNCATE student_punch; 
  SET FOREIGN_KEY_CHECKS = 1; 
  `);
};

// name, email, password, class_id, finger_id
const createFakeUser = async (roleId, startId, num, classId = null) => {
  try {
    const role = { 1: 'student', 2: 'teacher' };
    const password = 'test';
    // gen fake data
    const users = [];
    for (let i = startId; i < startId + num; i += 1) {
      const name = `${role[roleId]}_${i}`;
      const email = `${name}@test.com`;
      const hashedPassword = await argon2.hash(password);
      console.log(hashedPassword.length);
      if (classId) {
        users.push([name, email, hashedPassword, classId]);
      } else if (classId === null) {
        users.push([name, email, hashedPassword]);
      }
    }

    // const users = [
    //   { name: '葛國安', email: 'GeGuoAn@armyspy.com' },
    //   { name: '鄭恆慈', email: 'ZhengHengCi@teleworm.tw' },
    //   { name: '毛琬婷', email: 'MaoWanTing@teleworm.tw' },
    //   { name: '江依珊', email: 'JiangYiShan@teleworm.us' },
    //   { name: '陸于禎', email: 'LiuXuZheng@dayrep.com' },
    //   { name: '邱彥燈', email: 'QiuYanDeng@rhyta.com ' },
    // ];
    // const account = users.reduce(async (acc, cur) => {
    //   const hashedPassword = await argon2.hash(password);
    //   acc.push([cur.name, cur.email, hashedPassword, classId]);
    //   return acc;
    // }, []);

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

// name, email, password, class_id, finger_id
const createFakeUser2 = async (roleId, classId = null) => {
  try {
    const role = { 1: 'student', 2: 'teacher' };
    const password = 'test';
    // // gen fake data
    // const users = [];
    // for (let i = startId; i < startId + num; i += 1) {
    //   const name = `${role[roleId]}_${i}`;
    //   const email = `${name}@test.com`;
    //   const hashedPassword = await argon2.hash(password);
    //   console.log(hashedPassword.length);
    //   if (classId) {
    //     users.push([name, email, hashedPassword, classId]);
    //   } else if (classId === null) {
    //     users.push([name, email, hashedPassword]);
    //   }
    // }
    const users = [
      { name: '葛國安', email: 'GeGuoAn@armyspy.com' },
      { name: '鄭恆慈', email: 'ZhengHengCi@teleworm.tw' },
      { name: '毛琬婷', email: 'MaoWanTing@teleworm.tw' },
      { name: '江依珊', email: 'JiangYiShan@teleworm.us' },
      { name: '陸于禎', email: 'LiuXuZheng@dayrep.com' },
      { name: '邱彥燈', email: 'QiuYanDeng@rhyta.com ' },
    ];

    const forEachAsync = async (array, callback) => {
      for (let i = 0; i < array.length; i += 1) {
        await callback(array[i]);
      }
    };

    const accounts = [];
    await forEachAsync(users, async (user) => {
      const hashedPassword = await argon2.hash(password);
      accounts.push([user.name, user.email, hashedPassword, classId]);
    });

    // save fake data
    if (roleId === 1) {
      await promisePool.query('INSERT INTO student (name, email, password, class_id) VALUES ?', [accounts]);
    } else if (roleId === 2) {
      await promisePool.query('INSERT INTO staff (name, email, password) VALUES ?', [accounts]);
    }
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// 1: 'student', 2: 'teacher'
// gen 15 students first, same class
// roleId startId num classId
// truncateTable('student');
// createFakeUser(1, 1, 7, 1);
// createFakeUser(1, 8, 7, 2);
// gen 5 teacher
// createFakeUser(2, 1, 5);

// createFakeUser2(1, 1);

// student_id, punch_in, punch_out
const createFakePunch = async (days) => {
  try {
    await truncateTable('student_punch');
    const today = dayjs();
    const punchInInit = dayjs(`${today.format('YYYY-MM-DD')} 09:00:00`);
    const punchOutInit = dayjs(`${today.format('YYYY-MM-DD')} 18:00:00`);
    const [students] = await promisePool.query('SELECT id FROM student');
    const randomMin = () => Math.floor(Math.random() * 60) - 30;
    const getRandom = (n) => Math.ceil(Math.random() * n);
    const attendance = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const punchDate = today.subtract(i, 'day');
      students.forEach((student) => {
        const random = getRandom(50);
        let punchIn = punchInInit.add(randomMin(), 'minute');
        let punchOut = punchOutInit.add(randomMin(), 'minute');
        if (random <= 2) {
          punchIn = null;
          punchOut = null;
        } else if (random <= 10) {
          punchOut = null;
        }

        attendance.push([
          student.id, punchDate.format('YYYY-MM-DD'),
          (punchIn) ? punchIn.format('HH:mm:ss') : null,
          (punchOut) ? punchOut.format('HH:mm:ss') : null,
        ]);
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

const createLeaveTypes = async () => {
  try {
    await truncateTable('leave_type');
    const leaveTypes = [['事假'], ['病假']];
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
    const reason = 'test';
    const applications = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = today.subtract(i, 'day');
      students.forEach((student) => {
        if (random(rate) !== 0) {
          return;
        }
        const start = startInit.add(randomHour(), 'hour');
        const end = endInit.subtract(randomHour(), 'hour');
        let hours;
        const restStart = startInit.add(3, 'hour');
        const restEnd = startInit.add(4, 'hour');
        if (start <= restStart && end >= restEnd) { // 正常情況 start && end 都不在Rest範圍
          hours = restStart - start + end - restEnd;
        } else if (start >= restEnd || end <= restStart) { // 沒有重疊到Rest
          hours = end - start;
        } else if (start <= restStart && end < restEnd) { // end 在 Rest中
          hours = restStart - start;
        } else if (start >= restStart && end <= restEnd) { // start end 皆落在Rest範圍
          hours = 0;
        } else if (start >= restStart && end > restEnd) { // start 在Rest中
          hours = end - restEnd;
        }
        console.log(hours);
        const type = types[random(types.length)].id;
        applications.push([student.id, type, reason, date.format('YYYY-MM-DD'), start.format('HH:mm:ss'), end.format('HH:mm:ss'), hours / 60 / 60 / 1000]);
      });
    }
    console.log(applications);
    await promisePool.query('INSERT INTO student_leave (student_id, leave_type_id, reason, date, start, end, hours) VALUES ?', [applications]);
    console.log('completed');
  } catch (err) {
    console.log(err);
  }
};

// createLeaveTypes();
createFakeLeaveApplications(30, 15);
