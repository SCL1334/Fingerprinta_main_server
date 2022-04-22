const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const User = require('./user_model');
const Class = require('./class_model');
const { timeStringToMinutes } = require('../util/util');

const getAttendanceStatus = (punchIn, punchOut, start, end, breakStart, breakEnd) => {
  let status;
  const errorDetail = [];
  const application = [];

  if (!punchIn && !punchOut) {
    status = 1; // 未打卡
    errorDetail.push(1);
    application.push({ start, end });
  } else {
    if (timeStringToMinutes(start) + 5 < timeStringToMinutes(punchIn)) {
      status = 1; // 遲到
      errorDetail.push(3);
      if (timeStringToMinutes(punchIn) >= timeStringToMinutes(breakStart)) {
        application.push({ start, breakStart });
      }
    }
    if (!punchOut) {
      status = 1; // 下課沒打卡
      errorDetail.push(2);
      return { status, error: errorDetail };
    }
    if (timeStringToMinutes(end) > timeStringToMinutes(punchOut)) {
      status = 1; // 早退
      errorDetail.push(4);
      return { status, error: errorDetail };
    }
    if (errorDetail.length === 0) { // 正常
      status = 0;
      return { status };
    }
  }
  return { status, error: errorDetail };
};

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
    const today = dayjs();
    let searchTo = (today > dayjs(classDetail.end_date)) ? dayjs(classDetail.end_date).format('YYYY-MM-DD') : today.format('YYYY-MM-DD'); // default

    if (to && dayjs(classDetail.end_date) > dayjs(to) && dayjs(to) <= today) {
      searchTo = to;
    }
    // else if (!to && dayjs(classDetail.end_date) > today) {
    //   searchTo = today.format('YYYY-MM-DD');
    // }

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
    attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(b.date) - dayjs(a.date)));

    // 9. get student punch recording
    const studentPunchesRaw = await getPersonPunch(studentId, searchFrom, searchTo);
    // 10. tranfer punch recording to array (multi punches in one day)
    const studentPunches = studentPunchesRaw.reduce((acc, cur) => {
      if (!acc[cur.punch_date]) { acc[cur.punch_date] = []; }
      acc[cur.punch_date].push(cur);
      return acc;
    }, []);

    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time
    const studentAttendances = attendanceTemplates.reduce((acc, dateRule) => {
      const oneDatePunches = (studentPunches[dateRule.date]);

      // studentPunches要先處理沒打卡資料為null
      oneDatePunches.forEach((oneDatePunch) => {
        // deep copy
        const temp = JSON.parse(JSON.stringify(dateRule));
        temp.punch_in = oneDatePunch ? oneDatePunch.punch_in : null;
        temp.punch_out = oneDatePunch ? oneDatePunch.punch_out : null;

        // 判斷出席狀態
        const breakStart = '12:00';
        const breakEnd = '13:00';
        // check status
        const state = getAttendanceStatus(
          temp.punch_in,
          temp.punch_out,
          temp.start,
          temp.end,
          breakStart,
          breakEnd,
        );

        temp.status = state.status;
        temp.error = state.error;

        // add personal detail
        temp.student_id = studentBasic.id;
        temp.student_name = studentBasic.name;

        // add class detail
        temp.class_type_id = classDetail.class_type_id;
        temp.class_type_name = classDetail.class_type_name;
        temp.class_group_id = classDetail.class_group_id;
        temp.class_group_name = classDetail.class_group_name;
        temp.batch = classDetail.batch;
        acc.push(temp);
      });
      return acc;
    }, []);

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
    const today = dayjs();
    let searchTo = (today > dayjs(classDetail.end_date)) ? dayjs(classDetail.end_date).format('YYYY-MM-DD') : today.format('YYYY-MM-DD'); // default

    if (to && dayjs(classDetail.end_date) > dayjs(to) && dayjs(to) <= today) {
      searchTo = to;
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
    attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(b.date) - dayjs(a.date)));

    // 9. get student punch recording
    // {punch_date: stident_id: {student_id, punch_date, punch_in, punch_out, student_name}}
    const classPunchesRaw = await getClassPunch(classId, searchFrom, searchTo);

    // 10. tranfer punch recording to object (dictionary)
    const classPunches = classPunchesRaw.reduce((acc, cur) => {
      if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }
      if (!acc[cur.punch_date][cur.student_id]) { acc[cur.punch_date][cur.student_id] = []; }
      acc[cur.punch_date][cur.student_id].push(cur);
      return acc;
    }, {});
    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time

    const classAttendances = attendanceTemplates.reduce((acc, dateRule) => {
      // dateRule {student_id, student_name, date, start, end}
      // studentsPunchOneDate {student_id: {detail}}
      const studentsPunchOneDate = classPunches[dateRule.date];
      if (studentsPunchOneDate) {
        const studentPunches = studentsPunchOneDate[dateRule.student_id] || null;
        if (studentPunches) {
          studentPunches.forEach((oneDatePunch) => {
            // deep copy
            const temp = JSON.parse(JSON.stringify(dateRule));
            temp.punch_in = oneDatePunch.punch_in || null;
            temp.punch_out = oneDatePunch.punch_out || null;

            // 判斷出席狀態
            const breakStart = '12:00';
            const breakEnd = '13:00';
            // check status
            const state = getAttendanceStatus(
              temp.punch_in,
              temp.punch_out,
              temp.start,
              temp.end,
              breakStart,
              breakEnd,
            );

            temp.status = state.status;
            temp.error = state.error;

            // add personal detail
            temp.student_id = dateRule.student_id;
            temp.student_name = dateRule.student_id;

            // add class detail
            temp.class_type_id = classDetail.class_type_id;
            temp.class_type_name = classDetail.class_type_name;
            temp.class_group_id = classDetail.class_group_id;
            temp.class_group_name = classDetail.class_group_name;
            temp.batch = classDetail.batch;
            acc.push(temp);
          });
        } else { // if one student no data on that date
          // deep copy
          const temp = JSON.parse(JSON.stringify(dateRule));
          temp.punch_in = null;
          temp.punch_out = null;

          // 判斷出席狀態
          const breakStart = '12:00';
          const breakEnd = '13:00';
          // check status
          const state = getAttendanceStatus(
            temp.punch_in,
            temp.punch_out,
            temp.start,
            temp.end,
            breakStart,
            breakEnd,
          );

          temp.status = state.status;
          temp.error = state.error;

          // add personal detail
          temp.student_id = dateRule.student_id;
          temp.student_name = dateRule.student_id;

          // add class detail
          temp.class_type_id = classDetail.class_type_id;
          temp.class_type_name = classDetail.class_type_name;
          temp.class_group_id = classDetail.class_group_id;
          temp.class_group_name = classDetail.class_group_name;
          temp.batch = classDetail.batch;
          acc.push(temp);
        }
      }
      return acc;
    }, []);
    return classAttendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getAllAttendances = async (from, to) => {
  try {
    // // 1. find all class_type
    // const classTypes = await Class.getTypes();
    // 2-1. find all class info
    const classesRaw = await Class.getClasses();
    // 2-2 transfer classes data to object
    // {class_id: {class detail}}
    const classes = classesRaw.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    // 3-1. get class_routine by class_type_id from DB
    const classesRoutinesRaw = await Class.getRoutines();
    // 3-2. transfer classes routines data to object
    // {class_type_id: {weekday, start_time, end_time}
    const classRoutinesAll = classesRoutinesRaw.reduce((acc, cur) => {
      if (!acc[cur.class_type_id]) { acc[cur.class_type_id] = {}; }
      acc[cur.class_type_id][cur.weekday] = cur;
      return acc;
    }, {});

    // _____search each class_____
    let allAttendances = await Promise.all(classesRaw.map(async (clas) => {
      // 4. get a class's students list
      const studentList = await User.getStudents(clas.id);

      // 5. compare from / to : class start / end and today
      const today = dayjs();
      let searchTo = (today > dayjs(clas.end_date)) ? dayjs(clas.end_date).format('YYYY-MM-DD') : today.format('YYYY-MM-DD'); // default

      if (to && dayjs(clas.end_date) > dayjs(to) && dayjs(to) <= today) {
        searchTo = to;
      }
      let searchFrom = dayjs(clas.start_date).format('YYYY-MM-DD');
      if (from && dayjs(clas.start_date) < dayjs(from)) { searchFrom = from; }

      // 6. search exception day for this class with class_type_id and batch with current range
      const [exceptionDays] = await promisePool.query(`
        SELECT date, start, end FROM punch_exception 
        WHERE class_type_id = ? AND batch = ? AND date >= ? AND date <= ?; 
      `, [clas.class_type_id, clas.batch, searchFrom, searchTo]);
      exceptionDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

      // 7. get school day during current range
      const [schoolDays] = await promisePool.query(`
        SELECT date FROM calendar
        WHERE need_punch = 1 AND date >= ? AND date <= ?;
      `, [searchFrom, searchTo]);
      schoolDays.forEach((day) => day.date = dayjs(day.date).format('YYYY-MM-DD'));

      // 8. get class_routine by class_type_id from temp
      const classRoutines = classRoutinesAll[clas.class_type_id];

      // 9-1. generate attendance template(rules)
      // 9-2 according rule build a whole list including each students
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
        if (classRoutines[day]) {
          studentList.forEach((student) => {
            attendanceTemplates.push(
              {
                student_id: student.id,
                student_name: student.name,
                date: schoolDay.date,
                start: classRoutines[day].start_time,
                end: classRoutines[day].end_time,
              },
            );
          });
        }
      });

      // due to exception day, need to sort by date || can sort at the end?
      attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(b.date) - dayjs(a.date)));

      // 10. get student punch recording
      // {punch_date: stident_id: {student_id, punch_date, punch_in, punch_out, student_name}}
      const classPunchesRaw = await getClassPunch(clas.id, searchFrom, searchTo);

      // 11. tranfer punch recording to object (dictionary)
      const classPunches = classPunchesRaw.reduce((acc, cur) => {
        if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }
        acc[cur.punch_date][cur.student_id] = cur;
        return acc;
      }, {});

      // 12. from template, fill in punch recording from 9
      //     check attendance at the same time
      const classAttendances = attendanceTemplates.map((dateRule) => {
        // add class info
        dateRule.class_type_id = classes[clas.id].class_type_id;
        dateRule.class_type_name = classes[clas.id].class_type_name;
        dateRule.class_group_id = classes[clas.id].class_group_id;
        dateRule.class_group_name = classes[clas.id].class_group_name;
        dateRule.batch = classes[clas.id].batch;
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
    }));
    // 展開及排序
    allAttendances = allAttendances.flat();
    allAttendances = allAttendances.sort((b, a) => (dayjs(a.date) - dayjs(b.date)));

    return allAttendances;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = {
  setPunch,
  getAllPunch,
  getPersonPunch,
  getClassPunch,
  getPersonAttendance,
  getClassAttendance,
  getAllAttendances,
};
