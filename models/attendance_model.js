const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

const setPunch = async (studentId) => {
  try {
    const punch = dayjs();
    console.log(`user: ${studentId} | 打卡時間: ${punch.format()}`);
    // invalid id, reject
    // after complete studentId-fpId pair, use below
    // if (!studentId || studentId <= 0) return -1;
    if (!Number.isInteger(studentId) || studentId < 0) return -1;
    const [check] = await promisePool.query('SELECT id, student_id, punch_date, punch_in, punch_out FROM student_punch WHERE student_id = ? AND punch_date >= CURDATE() ORDER BY punch_in DESC;', [studentId]);
    // valid punch in
    if (check.length === 0) {
      await promisePool.query('INSERT INTO student_punch (student_id, punch_date, punch_in) VALUES (?, ?, ?)', [studentId, punch.format('YYYY-MM-DD'), punch.format('HH:mm:ss')]);
      return 1;
    }
    const { id, punch_in: punchIn, punch_out: punchOut } = check[0];
    // valid punch out or punch out has been completed, update the last one time
    if ((punchIn && !punchOut)) {
      await promisePool.query('UPDATE student_punch SET punch_out = ? WHERE id = ?', [punch.format('HH:mm:ss'), id]);
      return 2;
    }
    if (punchIn && punchOut) {
      await promisePool.query('INSERT INTO student_punch (student_id, punch_date, punch_in) VALUES (?, ?, ?)', [studentId, punch.format('YYYY-MM-DD'), punch.format('HH:mm:ss')]);
      return 1;
    }
    return -1;
  } catch (err) {
    console.log(err);
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

const getPersonPunch = async (studentId) => {
  try {
    const [attendances] = await promisePool.query(
      'SELECT student_id, punch_in, punch_out FROM student_punch WHERE student_id = ? ORDER BY punch_in DESC',
      [studentId],
    );
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

const getClassPunch = async (classId) => {
  try {
    const [attendances] = await promisePool.query(
      `SELECT student_id, punch_in, punch_out 
        FROM student_punch 
        WHERE student_id IN (SELECT id FROM usr WHERE class_id = ?) 
        ORDER BY punch_in DESC`,
      [classId],
    );
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

module.exports = {
  setPunch, getPunchAll, getPersonPunch, getClassPunch,
};
