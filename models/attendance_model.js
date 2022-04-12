const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

const setPunch = async (studentId) => {
  try {
    const punch = dayjs();
    console.log(`user: ${studentId} | 打卡時間: ${punch}`);
    // invalid id, reject
    // after complete studentId-fpId pair, use below
    // if (!studentId || studentId <= 0) return -1;
    if (!Number.isInteger(studentId) || studentId < 0) return -1;
    const [check] = await promisePool.query('SELECT id, student_id, punch_in, punch_out FROM student_punch WHERE student_id = ? AND punch_in >= CURDATE();', [studentId]);
    // valid punch in
    if (check.length === 0) {
      await promisePool.query('INSERT INTO student_punch (student_id, punch_in) VALUES (?, ?)', [studentId, punch.format()]);
      return 1;
    }
    const { id, punch_in: punchIn, punch_out: punchOut } = check[0];
    // valid punch out or punch out has been completed, update the last one time
    if ((punchIn && !punchOut) || punchOut) {
      await promisePool.query('UPDATE student_punch SET punch_out = ? WHERE id = ?', [punch.format(), id]);
      return 2;
    }
    return -1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    return 0;
  }
};

const getPunchAll = async () => {
  try {
    // 1: one person 2: class 3: all
    const [attendances] = await promisePool.query('SELECT student_id, punch_in, punch_out FROM student_punch ORDER BY punch_in DESC');
    attendances.map((attendance) => {
      attendance.punch_in = dayjs(attendance.punch_in).format('YYYY-MM-DDTHH:mm:ss');
      attendance.punch_out = dayjs(attendance.punch_out).format('YYYY-MM-DDTHH:mm:ss');
    });
    return attendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { setPunch, getPunchAll };
