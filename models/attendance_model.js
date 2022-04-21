const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const User = require('./user_model');
const Class = require('./class_model');
const { timeStringToMinutes } = require('../util/util');

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
    const [punches] = await promisePool.query(`
      SELECT sp.student_id, sp.punch_date, sp.punch_in, sp.punch_out, s.name AS student_name
      FROM student_punch AS sp 
      LEFT OUTER JOIN student as s ON sp.student_id = s.id 
      ${sqlFilter} 
      ORDER BY punch_date DESC, student_id ASC, punch_in ASC;
      `, [from, to]);
    punches.forEach((punch) => {
      punch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (punch.punch_in === '00:00:00') { punch.punch_in = null; }
      if (punch.punch_out === '00:00:00') { punch.punch_out = null; }
    });
    return punches;
  } catch (err) {
    console.log(err);
    return null;
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
    punches.forEach((punch) => {
      punch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (punch.punch_in === '00:00:00') { punch.punch_in = null; }
      if (punch.punch_out === '00:00:00') { punch.punch_out = null; }
    });
    return punches;
  } catch (err) {
    console.log(err);
    return null;
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
    punches.forEach((punch) => {
      punch.punch_date = dayjs(punch.punch_date).format('YYYY-MM-DD');
      if (punch.punch_in === '00:00:00') { punch.punch_in = null; }
      if (punch.punch_out === '00:00:00') { punch.punch_out = null; }
    });
    return punches;
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
    } else if (!to && dayjs(classDetail.end_date) > today) {
      searchTo = today.format('YYYY-MM-DD');
    }
    let searchFrom = dayjs(classDetail.start_date).format('YYYY-MM-DD');
    if (from && dayjs(classDetail.start_date) < dayjs(from)) { searchFrom = from; }

    // 4. search exception day for this class with class_type_id and batch with current range
    const [exceptionDays] = await promisePool.query(`
      SELECT date, start, end FROM punch_exception 
      WHERE class_type_id = ? AND batch = ? AND date >= ? AND date <= ?; 
    `, [classDetail.class_type_id, classDetail.batch, searchFrom, searchTo]);
    exceptionDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 5. get school day during current range
    const [schoolDays] = await promisePool.query(`
      SELECT date FROM calendar
      WHERE need_punch = 1 AND date >= ? AND date <= ?;
    `, [searchFrom, searchTo]);
    schoolDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 6. get class_routine by class_type_id
    const routinesRaw = await Class.getRoutines(classDetail.class_type_id);

    // 7. transfer routines to object (dictionary)
    const routines = routinesRaw.reduce((acc, cur) => {
      acc[cur.weekday] = { start: cur.start_time, end: cur.end_time };
      return acc;
    }, {});

    // 8. generate attendance template(rules)
    // format : {date, start, end}
    const recordException = new Set(); // use Set to confirm there won't be > 2 setting for 1 day
    let attendanceTemplates = [];
    exceptionDays.forEach((exception) => {
      recordException.add(exception.date);
      attendanceTemplates.push(
        { date: exception.date, start: exception.start, end: exception.end },
      );
    });
    schoolDays.forEach((schoolDay) => {
      if (recordException.has(schoolDay.date)) { return; }
      const day = dayjs(schoolDay.date).day();
      if (routines[day]) {
        attendanceTemplates.push(
          { date: schoolDay.date, start: routines[day].start, end: routines[day].end },
        );
      }
    });
    // due to exception day, need to sort by date
    attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(a.date) - dayjs(b.date)));

    // 9. get student punch recording
    const studentPunchesRaw = await getPersonPunch(studentId, searchFrom, searchTo);
    // 10. tranfer punch recording to object (dictionary)
    const studentPunches = studentPunchesRaw.reduce((acc, cur) => {
      acc[cur.punch_date] = cur;
      return acc;
    }, {});
    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time
    const studentAttendances = attendanceTemplates.map((dateRule) => {
      const punchDate = (studentPunches[dateRule.date]);
      // studentPunches要先處理沒打卡資料為null
      dateRule.punch_in = punchDate ? punchDate.punch_in : null;
      dateRule.punch_out = punchDate ? punchDate.punch_out : null;

      // 判斷出席狀態
      let status = 0; // 正常
      if (!dateRule.punch_in && !dateRule.punch_out) {
        status = 1; // 未打卡
      } else if (!dateRule.punch_out) {
        status = 2; // 下課沒打卡
      } else if (timeStringToMinutes(dateRule.start) + 5 < timeStringToMinutes(dateRule.punch_in)) {
        status = 3; // 遲到
      } else if (timeStringToMinutes(dateRule.end) > timeStringToMinutes(dateRule.punch_out)) {
        status = 4; // 早退
      }
      dateRule.status = status;
      return dateRule;
    });

    return studentAttendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getClassAttendance = async (classId, from, to) => {
  try {
    // 1. find class info by class_id
    const classDetail = await Class.getOneClass(classId);

    // 2. find student list of a class
    const studentList = await User.getStudents(classId);

    // 3. compare from / to : class start / end and today
    let searchTo = dayjs(classDetail.end_date).format('YYYY-MM-DD');
    const today = dayjs();
    if (to && dayjs(classDetail.end_date) > dayjs(to) && dayjs(to) <= today) {
      searchTo = to;
    } else if (!to && dayjs(classDetail.end_date) > today) {
      searchTo = today.format('YYYY-MM-DD');
    }
    let searchFrom = dayjs(classDetail.start_date).format('YYYY-MM-DD');
    if (from && dayjs(classDetail.start_date) < dayjs(from)) { searchFrom = from; }

    // 4. search exception day for this class with class_type_id and batch with current range
    const [exceptionDays] = await promisePool.query(`
        SELECT date, start, end FROM punch_exception 
        WHERE class_type_id = ? AND batch = ? AND date >= ? AND date <= ?; 
      `, [classDetail.class_type_id, classDetail.batch, searchFrom, searchTo]);
    exceptionDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 5. get school day during current range
    const [schoolDays] = await promisePool.query(`
        SELECT date FROM calendar
        WHERE need_punch = 1 AND date >= ? AND date <= ?;
      `, [searchFrom, searchTo]);
    schoolDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

    // 6. get class_routine by class_type_id
    const routinesRaw = await Class.getRoutines(classDetail.class_type_id);

    // 7. transfer routines to object (dictionary)
    const routines = routinesRaw.reduce((acc, cur) => {
      acc[cur.weekday] = { start: cur.start_time, end: cur.end_time };
      return acc;
    }, {});

    // 8-1. generate attendance template(rules)
    // 8-2 according rule build a whole list including each students
    // need to record each student name => use studentList
    // format : {student_name, date, start, end}
    const recordException = new Set(); // use Set to confirm there won't be > 2 setting for 1 day
    let attendanceTemplates = [];
    exceptionDays.forEach((exception) => {
      recordException.add(exception.date);
      studentList.forEach((student) => {
        attendanceTemplates.push(
          {
            student_id: student.id,
            student_name: student.name,
            date: exception.date,
            start: exception.start,
            end: exception.end,
          },
        );
      });
    });

    schoolDays.forEach((schoolDay) => {
      if (recordException.has(schoolDay.date)) { return; }
      const day = dayjs(schoolDay.date).day();
      if (routines[day]) {
        studentList.forEach((student) => {
          attendanceTemplates.push(
            {
              student_id: student.id,
              student_name: student.name,
              date: schoolDay.date,
              start: routines[day].start,
              end: routines[day].end,
            },
          );
        });
      }
    });

    // due to exception day, need to sort by date
    attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(a.date) - dayjs(b.date)));

    // 9. get student punch recording
    // {punch_date: stident_id: {student_id, punch_date, punch_in, punch_out, student_name}}
    const classPunchesRaw = await getClassPunch(classId, searchFrom, searchTo);

    // 10. tranfer punch recording to object (dictionary)
    const classPunches = classPunchesRaw.reduce((acc, cur) => {
      if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }
      acc[cur.punch_date][cur.student_id] = cur;
      return acc;
    }, {});

    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time

    const classAttendances = attendanceTemplates.map((dateRule) => {
      // dateRule {student_id, student_name, date, start, end}
      // studentsPunchOneDate {student_id: {detail}}
      const studentsPunchOneDate = classPunches[dateRule.date];
      dateRule.punch_in = null;
      dateRule.punch_out = null;
      if (studentsPunchOneDate) {
        const studentPunch = studentsPunchOneDate[dateRule.student_id] || null;
        dateRule.punch_in = studentPunch ? studentPunch.punch_in : null;
        dateRule.punch_out = studentPunch ? studentPunch.punch_out : null;
      }

      // 判斷出席狀態
      let status = 0; // 正常
      if (!dateRule.punch_in && !dateRule.punch_out) {
        status = 1; // 未打卡
      } else if (!dateRule.punch_out) {
        status = 2; // 下課沒打卡
      } else if (timeStringToMinutes(dateRule.start) + 5 < timeStringToMinutes(dateRule.punch_in)) {
        status = 3; // 遲到
      } else if (timeStringToMinutes(dateRule.end) > timeStringToMinutes(dateRule.punch_out)) {
        status = 4; // 早退
      }
      dateRule.status = status;
      return dateRule;
    });

    return classAttendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = {
  setPunch, getAllPunch, getPersonPunch, getClassPunch, getPersonAttendance, getClassAttendance,
};
