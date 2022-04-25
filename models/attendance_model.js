const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const User = require('./user_model');
const Class = require('./class_model');
const Leave = require('./leave_model');
const {
  timeStringToMinutes, minutesToTimeString, getCeilHourTime, minToFloorHourTime,
} = require('../util/util');

const lunchBreakStart = '12:00'; // 午休
const lunchBreakEnd = '13:00';

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

const checkAttendanceToLeave = (breakStart, breakEnd, start, end, punches) => {
  // console.log(punches);
  const breakStartMin = timeStringToMinutes(breakStart);
  const breakEndMin = timeStringToMinutes(breakEnd);
  const inBreak = (time) => (time > breakStartMin && time < breakEndMin);

  let cur = timeStringToMinutes(start); // 初始標記 = 上課時間 Min
  let nextStart = timeStringToMinutes(start); // 下次打卡起始時間 Min
  let punchIn; // 打卡上課String
  let punchOut; // 打卡下課String
  let punchInMin; // 換算min
  let punchOutMin; // 換算min
  let stustart; // 系統換算開始上課時間
  let stustop; // 系統換算下課時間
  let breakFlag; // 中斷點 如果下課後還有多的打卡記錄 之後就不看
  const endMin = timeStringToMinutes(end); // 結束計算 = 下課時間

  let attendanceHours; // 原本出席時數
  const minToHours = (min) => Math.ceil(min / 60);
  const gap = parseInt((breakEndMin - breakStartMin) / 60);
  if ((cur >= breakStartMin && cur < breakEndMin) && (endMin > breakStartMin && endMin <= breakEndMin)) { // 開始結束都在午休
    attendanceHours = 0;
  } else if ((cur >= breakStartMin && cur < breakEndMin) || (endMin > breakStartMin && endMin <= breakEndMin)) { // 開始或結束在午休
    attendanceHours = minToHours(endMin - cur) - gap;
  } else if (cur < breakStartMin && endMin > breakEndMin) {
    attendanceHours = minToHours(endMin - cur) - gap;
  } else {
    attendanceHours = minToHours(endMin - cur);
  }

  const attendanceNeed = attendanceHours;

  if (punches === null || punches[0][0] === null) { // 無打卡資料
    return {
      leave: [{
        description: 'absent', hours: attendanceNeed, start, end,
      }],
      detail: [{ punch_in: null, punch_out: null }],
      attendance_need: attendanceNeed,
      attendance_real: 0,
    };
  }

  const leave = [];
  const detail = [];
  // punch [[punch_in, punch_out], []...]
  punches.forEach((punch) => { // 處理每筆打卡
    const punchDetail = {};
    // console.log(punch);
    if (breakFlag === true) { // 中斷 跳過不處理
      return;
    }

    // console.log('________打卡分隔________');

    [punchIn, punchOut] = punch;
    punchDetail.punch_in = punchIn;
    punchDetail.punch_out = punchOut;
    detail.push(punchDetail);
    punchInMin = timeStringToMinutes(punch[0]);
    punchOutMin = timeStringToMinutes(punch[1]);

    // console.log('應上課', cur / 60, '實際打卡', punchIn);

    if (!punchOut || punchInMin > endMin) { // 如果打卡不完整 當成沒打卡 || 下課後打卡 不處理
      breakFlag = true;
      return;
    }

    if (punchInMin > cur) { // 打上課卡時間 > 目前起始時間
      let leaveHour;
      let leaveStart;
      let leaveStop;
      // console.log(`遲到 ${punchInMin - nextStart}`);
      if (inBreak(punchInMin)) { // 如果在午休打上課卡
        leaveStop = breakStart;
        leaveStart = Math.ceil(nextStart / 60);
        leaveHour = Math.ceil((breakStartMin - nextStart) / 60);
      } else if (cur <= breakStartMin && punchInMin > breakEndMin) {
        leaveStop = punchIn;
        leaveStart = nextStart;
        leaveHour = Math.ceil((punchInMin - nextStart) / 60) - 1;
      } else {
        leaveStop = punchIn;
        leaveStart = nextStart;
        leaveHour = Math.ceil((punchInMin - nextStart) / 60);
      }
      // console.log(`應請假時數 ${leaveHour}`);
      attendanceHours -= leaveHour;
      leave.push({
        leave_type_id: 3,
        description: 'late',
        hours: leaveHour,
        start: minutesToTimeString(leaveStart),
        end: getCeilHourTime(leaveStop),
      });
    }

    cur = Math.ceil(punchInMin / 60) * 60;

    stustart = cur / 60;
    // console.log(`開始上課 ${stustart}`);

    // 處理完上課卡

    cur = Math.floor(punchOutMin / 60) * 60; // 標記移動到打下課卡時間

    // console.log(`結束上課 ${cur / 60}`);

    if (cur >= timeStringToMinutes(breakStart) && cur < timeStringToMinutes(breakEnd)) { // 遇到午休
      cur = timeStringToMinutes(breakEnd);
    }
    stustop = cur / 60;
    nextStart = stustop * 60;

    if (cur >= endMin || nextStart >= endMin) { // 標記超過規定下課時間
      breakFlag = true;
    }
  });

  // 最後結算
  if (cur < endMin) { // 如果時間點還沒到規定下課時間
    // console.log(`早退 ${endMin - punchOutMin}`);
    // console.log('應下課', end, '實際下課', punchOut);
    let leaveHour;
    if (cur < breakEndMin) {
      leaveHour = (endMin - cur) / 60 - 1;
      // console.log(`應請假時數 ${leaveHour} `);
    } else {
      leaveHour = (endMin - cur) / 60;
      // console.log(`應請假時數 ${leaveHour}`);
    }
    // console.log(cur);
    attendanceHours -= leaveHour;
    leave.push({
      leave_type_id: 3,
      description: 'early',
      hours: leaveHour,
      start: minToFloorHourTime(cur) || start,
      end,
    });
  }

  if (stustart - stustop === 0) { // 處理上課時間被吃掉部分
    Math.floor((endMin - cur) / 60) - Math.floor((punchOutMin - punchInMin) / 60);
  }

  return {
    leave, detail, attendance_need: attendanceNeed, attendance_real: attendanceHours,
  };
};

const checkAttendanceStatus = (breakStart, breakEnd, start, end, punches = [], leaves = []) => {
  const getHalfHourFromStr = (time) => {
    const [hour] = time.split(':');
    return parseInt(hour, 10);
  };

  const toTime = (halfHour) => {
    const hour = Math.trunc(halfHour / 2);
    const hourStr = (hour < 10) ? `0${hour}` : hour;
    const minute = Math.trunc(((halfHour / 2) % 1) * 60);
    const minStr = (minute < 10) ? `0${minute}` : minute;
    return `${hourStr}:${minStr}`;
  };

  const getStudentStart = (time) => {
    const minutes = timeStringToMinutes(time);
    const hour = Math.ceil(minutes / 30);
    return hour;
  };

  const getStudentEnd = (time) => {
    const minutes = timeStringToMinutes(time);
    const hour = Math.floor(minutes / 30);
    return hour;
  };

  // count with half hour
  const startHour = getHalfHourFromStr(start) * 2;
  const endHour = getHalfHourFromStr(end) * 2;
  const breakStartHour = getHalfHourFromStr(breakStart) * 2;
  const breakEndHour = getHalfHourFromStr(breakEnd) * 2;

  // init attendance
  const attendance = {};
  let pauseFlag = false;
  for (let i = startHour; i < endHour; i += 1) {
    if (i === breakStartHour) { pauseFlag = true; }
    if (i === breakEndHour) { pauseFlag = false; }
    if (pauseFlag === false) { attendance[toTime(i)] = 1; }
  }

  punches.forEach((punch) => {
    const [punchIn, punchOut] = punch;
    if (!punchOut) { return; }
    const punchInHour = getStudentStart(punchIn);
    const punchOutHour = getStudentEnd(punchOut);
    let breakTime = false;
    for (let i = punchInHour; i < punchOutHour; i += 1) {
      if (i > endHour) { break; }
      if (i === breakStartHour) { breakTime = true; }
      if (i === breakEndHour) { breakTime = false; }
      if (breakTime === false) { attendance[toTime(i)] = 0; }
    }
  });

  leaves.forEach((leave) => {
    const [leaveStart, leaveEnd] = leave;
    if (!leaveStart) { return; }
    const leaveStartHour = getStudentStart(leaveStart);
    const leaveEndHour = getStudentEnd(leaveEnd);
    let breakTime = false;
    for (let i = leaveStartHour; i < leaveEndHour; i += 1) {
      if (i > endHour) { break; }
      if (i === breakStartHour) { breakTime = true; }
      if (i === breakEndHour) { breakTime = false; }
      if (breakTime === false) { attendance[toTime(i)] = 2; }
    }
  });
  return attendance;
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

    // console.log(studentPunchesRaw);
    // 10. tranfer punch recording to array (multi punches in one day)
    const studentPunches = studentPunchesRaw.reduce((acc, cur) => {
      const punch = [cur.punch_in, cur.punch_out];
      delete cur.punch_in;
      delete cur.punch_out;
      if (!acc[cur.punch_date]) {
        cur.punches = [punch];
        acc[cur.punch_date] = cur;
      } else {
        acc[cur.punch_date].punches.push(punch);
      }
      return acc;
    }, {});

    //  get valid leave
    const studentLeavesRaw = await Leave.checkStudentValidLeaves(studentId, from, to);
    const studentLeaves = studentLeavesRaw.reduce((acc, cur) => {
      if (!acc[cur.date]) {
        acc[cur.date] = [];
      }
      acc[cur.date].push(cur);
      return acc;
    }, {});

    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time
    // 判斷出席狀態

    const studentAttendances = attendanceTemplates.reduce((acc, dateRule) => {
      const oneDatePunches = studentPunches[dateRule.date];

      const result = checkAttendanceToLeave(
        lunchBreakStart,
        lunchBreakEnd,
        dateRule.start,
        dateRule.end,
        (oneDatePunches) ? oneDatePunches.punches : [[null, null]],
      );

      // add personal detail
      { dateRule.student_id = studentBasic.id; }
      dateRule.student_name = studentBasic.name;

      // add class detail
      dateRule.class_type_id = classDetail.class_type_id;
      dateRule.class_type_name = classDetail.class_type_name;
      dateRule.class_group_id = classDetail.class_group_id;
      dateRule.class_group_name = classDetail.class_group_name;
      dateRule.batch = classDetail.batch;

      // add abnormal punch
      dateRule.trans_to_leave = result.leave;
      dateRule.punch = result.detail;
      dateRule.attendance_need = result.attendance_need;
      dateRule.attendance_real = result.attendance_real;

      // 確認同天有沒有已經核准假單
      dateRule.progress = 0;
      if (result.length === 0) { dateRule.progress = 1; }

      // if has valid leave on that day
      if (studentLeaves[dateRule.date]) {
        studentLeaves[dateRule.date].forEach((leave) => {
          delete leave.batch;
          delete leave.class_group_name;
          delete leave.class_type_name;
          delete leave.student_name;
          delete leave.student_id;
        });
        delete dateRule.trans_to_leave;
        dateRule.progress = 1;
        dateRule.trans_to_leave = studentLeaves[dateRule.date];
      }

      acc.push(dateRule);

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
      const punch = [cur.punch_in, cur.punch_out];
      delete cur.punch_in;
      delete cur.punch_out;
      if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }

      if (!acc[cur.punch_date][cur.student_id]) {
        cur.punches = [punch];
        acc[cur.punch_date][cur.student_id] = cur;
      } else {
        acc[cur.punch_date][cur.student_id].punches.push(punch);
      }
      return acc;
    }, {});

    // 11. from template, fill in punch recording from 9
    //     check attendance at the same time

    const classAttendances = attendanceTemplates.reduce((acc, dateRule) => {
      const studentsPunchOneDate = classPunches[dateRule.date];
      if (studentsPunchOneDate) {
        if (studentsPunchOneDate[dateRule.student_id]) { // 有打卡記錄
          const studentPunches = (studentsPunchOneDate[dateRule.student_id]) ? studentsPunchOneDate[dateRule.student_id].punches : null;
          const result = checkAttendanceToLeave(
            lunchBreakStart,
            lunchBreakEnd,
            dateRule.start,
            dateRule.end,
            studentPunches,
          );

          // add class detail
          dateRule.class_type_id = classDetail.class_type_id;
          dateRule.class_type_name = classDetail.class_type_name;
          dateRule.class_group_id = classDetail.class_group_id;
          dateRule.class_group_name = classDetail.class_group_name;
          dateRule.batch = classDetail.batch;

          // add abnormal punch
          dateRule.trans_to_leave = result.leave;
          dateRule.punch = result.detail;
          dateRule.attendance_need = result.attendance_need;
          dateRule.attendance_real = result.attendance_real;

          acc.push(dateRule);
        } else {
          const studentPunches = [[null, null]];
          const result = checkAttendanceToLeave(
            lunchBreakStart,
            lunchBreakEnd,
            dateRule.start,
            dateRule.end,
            studentPunches,
          );

          // add class detail
          dateRule.class_type_id = classDetail.class_type_id;
          dateRule.class_type_name = classDetail.class_type_name;
          dateRule.class_group_id = classDetail.class_group_id;
          dateRule.class_group_name = classDetail.class_group_name;
          dateRule.batch = classDetail.batch;

          // add abnormal punch
          dateRule.trans_to_leave = result.leave;
          dateRule.punch = result.detail;
          dateRule.attendance_need = result.attendance_need;
          dateRule.attendance_real = result.attendance_real;

          acc.push(dateRule);
        }
      } else { // 無打卡記錄
        const studentPunches = [[null, null]];
        const result = checkAttendanceToLeave(
          lunchBreakStart,
          lunchBreakEnd,
          dateRule.start,
          dateRule.end,
          studentPunches,
        );
        // add class detail
        dateRule.class_type_id = classDetail.class_type_id;
        dateRule.class_type_name = classDetail.class_type_name;
        dateRule.class_group_id = classDetail.class_group_id;
        dateRule.class_group_name = classDetail.class_group_name;
        dateRule.batch = classDetail.batch;

        // add abnormal punch
        dateRule.trans_to_leave = result.leave;
        dateRule.punch = result.detail;
        dateRule.attendance_need = result.attendance_need;
        dateRule.attendance_real = result.attendance_real;

        acc.push(dateRule);
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
        const punch = [cur.punch_in, cur.punch_out];
        delete cur.punch_in;
        delete cur.punch_out;
        if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }

        if (!acc[cur.punch_date][cur.student_id]) {
          cur.punches = [punch];
          acc[cur.punch_date][cur.student_id] = cur;
        } else {
          acc[cur.punch_date][cur.student_id].punches.push(punch);
        }
        return acc;
      }, {});

      // 12 get student leaves

      const classLeavesRaw = await Leave.getClassLeaves(clas.id, searchFrom, searchTo);

      // 13 transfer leave to object
      const classLeaves = classLeavesRaw.reduce((acc, cur) => {
        const leave = [cur.start, cur.end];
        delete cur.start;
        delete cur.end;
        if (!acc[cur.date]) { acc[cur.date] = {}; }
        if (!acc[cur.date][cur.student_id]) {
          cur.leaves = [leave];
          acc[cur.date][cur.student_id] = cur;
        } else {
          acc[cur.date][cur.student_id].leaves.push(leave);
        }
        return acc;
      }, {});

      // 12. from template, fill in punch recording from 9
      //     check attendance at the same time

      const classAttendances = attendanceTemplates.reduce((acc, dateRule) => {
        const studentsPunchOneDate = classPunches[dateRule.date];
        const studentsLeavesOneDate = classLeaves[dateRule.date];
        const studentLeaves = (studentsLeavesOneDate && studentsLeavesOneDate[dateRule.student_id])
          ? studentsLeavesOneDate[dateRule.student_id].leaves : [];
        const studentPunches = (studentsPunchOneDate && studentsPunchOneDate[dateRule.student_id])
          ? studentsPunchOneDate[dateRule.student_id].punches : [];

        const attendance = checkAttendanceStatus(
          lunchBreakStart,
          lunchBreakEnd,
          dateRule.start,
          dateRule.end,
          studentPunches,
          studentLeaves,
        );

        // add class detail
        dateRule.class_type_id = classes[clas.id].class_type_id;
        dateRule.class_type_name = classes[clas.id].class_type_name;
        dateRule.class_group_id = classes[clas.id].class_group_id;
        dateRule.class_group_name = classes[clas.id].class_group_name;
        dateRule.batch = classes[clas.id].batch;

        dateRule.attendance = attendance;

        acc.push(dateRule);

        return acc;
      }, []);
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
