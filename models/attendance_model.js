const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const { MysqlError } = require('../util/custom_error');

const setPunch = async (studentId) => {
  try {
    const punch = dayjs();
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
  } catch (error) {
    return new MysqlError(2001, error.message);
  }
};

const getAllPunch = async (from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'WHERE punch_date >= ? AND punch_date <= ?' : '';
    // 1: one person 2: class 3: all
    const [punches] = await promisePool.query(`
      SELECT sp.student_id, sp.punch_date, sp.punch_in, sp.punch_out, s.name AS student_name
      FROM student_punch AS sp 
      LEFT OUTER JOIN student as s ON sp.student_id = s.id 
      ${sqlFilter} 
      ORDER BY punch_date DESC, student_id ASC, punch_in ASC;
      `, [from, to]);
    const checkedPunches = punches.map((punch) => {
      const formattedPunch = JSON.parse(JSON.stringify(punch));
      formattedPunch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (formattedPunch.punch_in === '00:00:00') { formattedPunch.punch_in = null; }
      if (formattedPunch.punch_out === '00:00:00') { formattedPunch.punch_out = null; }
      return formattedPunch;
    });
    return checkedPunches;
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

const getPersonPunch = async (studentId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND punch_date >= ? AND punch_date <= ?' : '';
    const [punches] = await promisePool.query(
      `
      SELECT sp.student_id, sp.punch_date, sp.punch_in, sp.punch_out, s.name AS student_name
      FROM student_punch AS sp 
      LEFT OUTER JOIN student as s ON sp.student_id = s.id 
      WHERE student_id = ? 
      ${sqlFilter} 
      ORDER BY punch_date DESC, punch_in ASC;
      `,
      [studentId, from, to],
    );
    const checkedPunches = punches.map((punch) => {
      const formattedPunch = JSON.parse(JSON.stringify(punch));
      formattedPunch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (formattedPunch.punch_in === '00:00:00') { formattedPunch.punch_in = null; }
      if (formattedPunch.punch_out === '00:00:00') { formattedPunch.punch_out = null; }
      return formattedPunch;
    });
    return checkedPunches;
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

const getClassPunch = async (classId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND punch_date >= ? AND punch_date <= ?' : '';
    const [punches] = await promisePool.query(
      `
      SELECT sp.student_id, sp.punch_date, sp.punch_in, sp.punch_out, s.name AS student_name
      FROM student_punch AS sp 
      LEFT OUTER JOIN student as s ON sp.student_id = s.id 
      WHERE student_id IN (SELECT id FROM student WHERE class_id = ?) 
      ${sqlFilter} 
      ORDER BY punch_date DESC, student_id ASC, punch_in ASC;
      `,
      [classId, from, to],
    );
    const checkedPunches = punches.map((punch) => {
      const formattedPunch = JSON.parse(JSON.stringify(punch));
      formattedPunch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (formattedPunch.punch_in === '00:00:00') { formattedPunch.punch_in = null; }
      if (formattedPunch.punch_out === '00:00:00') { formattedPunch.punch_out = null; }
      return formattedPunch;
    });
    return checkedPunches;
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

module.exports = {
  setPunch,
  getAllPunch,
  getPersonPunch,
  getClassPunch,
};
