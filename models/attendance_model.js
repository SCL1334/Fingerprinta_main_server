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
    const [check] = await promisePool.query('SELECT id, punch_in, punch_out FROM student_punch WHERE student_id = ? AND punch_in >= CURDATE();', [studentId]);
    console.log(check);
    // valid punch in
    if (check.length === 0) {
      await promisePool.query('INSERT INTO student_punch (student_id, punch_in) VALUES (?, ?)', [studentId, punch.format()]);
      return 1;
    }
    const { id, punch_in: punchIn, punch_out: punchOut } = check[0];
    // valid punch out
    if (punchIn && !punchOut) {
      await promisePool.query('UPDATE student_punch SET punch_out = ? WHERE id = ?', [punch.format(), id]);
      return 2;
    }
    // no punch in, valid punch out
    // pending

    // punch out has been completed, reject
    if (punchOut) return -1;
    return -1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    return 0;
  }
};

module.exports = { setPunch };
