const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const User = require('./user_model');
const Class = require('./class_model');

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

const getAllPunch = async (from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'WHERE punch_date >= ? AND punch_date <= ?' : '';
    // 1: one person 2: class 3: all
    const [attendances] = await promisePool.query(`
      SELECT sp.student_id, sp.punch_date, sp.punch_in, sp.punch_out, s.name AS student_name
      FROM student_punch AS sp 
      LEFT OUTER JOIN student as s ON sp.student_id = s.id 
      ${sqlFilter} 
      ORDER BY punch_date DESC, student_id ASC, punch_in ASC;
      `, [from, to]);
    attendances.forEach((attendance) => {
      attendance.punch_date = dayjs(attendance.punch_date).format('YYYY-MM-DD');
    });
    return attendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getPersonPunch = async (studentId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND punch_date >= ? AND punch_date <= ?' : '';
    const [attendances] = await promisePool.query(
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
    attendances.forEach((attendance) => {
      attendance.punch_date = dayjs(attendance.punch_date).format('YYYY-MM-DD');
    });
    return attendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getClassPunch = async (classId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND punch_date >= ? AND punch_date <= ?' : '';
    const [attendances] = await promisePool.query(
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
    attendances.forEach((attendance) => {
      attendance.punch_date = dayjs(attendance.punch_date).format('YYYY-MM-DD');
    });
    return attendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getPersonAttendance = async (studentId, from, to) => {
  try {
    // 1. find students info and get class_id
    const studentBasic = await User.getOneStudent(studentId);

    // 2. Use class_id to get class_detail
    const classDetail = await Class.getOneClass(studentBasic.class_id);

    // 3. compare from / to : class start / end and today
    let searchTo = dayjs(classDetail.end_date).format('YYYY-MM-DD');
    const today = dayjs();
    if (to && dayjs(classDetail.end_date) > dayjs(to) && dayjs(to) <= today) {
      searchTo = to;
    } else if (!to || dayjs(to) > today) {
      searchTo = today.format('YYYY-MM-DD');
    }
    let searchFrom = dayjs(classDetail.start_date).format('YYYY-MM-DD');
    if (from && dayjs(classDetail.start_date) < dayjs(from)) { searchFrom = from; }

    // 4. search exception day for this class with class_type_id and batch with current range
    const [exceptionDays] = await promisePool.query(`
      SELECT date, start, end FROM punch_exception 
      WHERE class_type_id = ? AND batch = ? AND date >= ? AND date <= ?; 
    `, [classDetail.class_type_id, classDetail.batch, searchFrom, searchTo]);
    exceptionDays.map((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 5. get school day during current range
    const [schoolDays] = await promisePool.query(`
      SELECT date FROM calendar
      WHERE need_punch = 1 AND date >= ? AND date <= ?;
    `, [searchFrom, searchTo]);
    schoolDays.map((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 6. get class_routine by class_type_id
    const routines = await Class.getRoutines(classDetail.class_type_id);

    // 7. generate attendance template
    //

    // 8. get student punch recording

    // 9. tranfer punch recording to object (dictionary)

    // 10. from template, fill in punch recording from 9
    //     check attendance at the same time
    return routines;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = {
  setPunch, getAllPunch, getPersonPunch, getClassPunch, getPersonAttendance,
};
