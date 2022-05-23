require('dotenv').config();
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(isBetween);
const User = require('../models/user_model');
const Class = require('../models/class_model');
const Leave = require('../models/leave_model');
const Calendar = require('../models/calendar_model');
const Attendance = require('../models/attendance_model');
const {
  getHalfHourFromStr, toTime, getStudentStart, getStudentEnd,
} = require('../util/time_transformer');
const { GeneralError } = require('../util/custom_error');

const { LATE_BUFFER, REST_START, REST_END } = process.env;

const lunchBreakStart = REST_START; // 午休
const lunchBreakEnd = REST_END;

const checkAttendanceStatus = (breakStart, breakEnd, start, end, punches = [], leaves = []) => {
  // count with half hour
  const startHour = getHalfHourFromStr(start) * 2;
  const endHour = getHalfHourFromStr(end) * 2;
  const breakStartHour = getHalfHourFromStr(breakStart) * 2;
  const breakEndHour = getHalfHourFromStr(breakEnd) * 2;

  // 0: no record
  // 1: punch
  // 2: leave not approval
  // 3: leave approval need count time
  // 4: leave approval no need to count time
  // init attendance
  const attendance = {};
  let pauseFlag = false;
  for (let i = startHour; i < endHour; i += 1) {
    if (i === breakStartHour) { pauseFlag = true; }
    if (i === breakEndHour) { pauseFlag = false; }
    if (pauseFlag === false) { attendance[toTime(i)] = 0; }
  }

  punches.forEach((punch) => {
    const [punchIn, punchOut] = punch;
    if (!punchOut) { return; }
    const punchInHour = getStudentStart(punchIn, start, LATE_BUFFER);
    const punchOutHour = getStudentEnd(punchOut, end);
    let breakTime = false;
    for (let i = punchInHour; i < punchOutHour; i += 1) {
      if (i > endHour) { break; }
      if (i === breakStartHour) { breakTime = true; }
      if (i === breakEndHour) { breakTime = false; }
      if (breakTime === false) { attendance[toTime(i)] = 1; }
    }
  });

  leaves.forEach((leave) => {
    const [leaveStart, leaveEnd, approval, needCalculate] = leave;
    if (!leaveStart) { return; }
    const leaveStartHour = getStudentStart(leaveStart, start, LATE_BUFFER);
    const leaveEndHour = getStudentEnd(leaveEnd, end);
    let breakTime = false;
    for (let i = leaveStartHour; i < leaveEndHour; i += 1) {
      if (i > endHour) { break; }
      if (i === breakStartHour) { breakTime = true; }
      if (i === breakEndHour) { breakTime = false; }
      if (breakTime === false) {
        if (approval === 0) { // check approval if 1 => OK if 0 need staff check
          attendance[toTime(i)] = 2;
        } else if (approval === 1) {
          if (needCalculate === 1) {
            attendance[toTime(i)] = 3;
          } else {
            attendance[toTime(i)] = 4;
          }
        }
      }
    }
  });
  return attendance;
};

const getClassSearchRange = (classStart, classEnd, from, to) => {
  // 3. compare from / to : class start / end and today
  const today = dayjs();
  let searchTo = (today > dayjs(classEnd)) ? dayjs(classEnd).format('YYYY-MM-DD') : today.format('YYYY-MM-DD'); // default

  if (to && dayjs(classEnd) > dayjs(to) && dayjs(to) <= today) {
    searchTo = to;
  }
  // else if (!to && dayjs(classDetail.end_date) > today) {
  //   searchTo = today.format('YYYY-MM-DD');
  // }

  let searchFrom = dayjs(classStart).format('YYYY-MM-DD');
  if (from && dayjs(classStart) < dayjs(from)) { searchFrom = from; }
  return { classSearchFrom: searchFrom, classSearchTo: searchTo };
};

const getExceptionDaysAll = async (from, to) => {
  // {type: {batch: {date, start, end}}}
  const exceptionDaysRaw = await Calendar.getExceptionDays(from, to);
  const exceptionDaysAll = exceptionDaysRaw.reduce((acc, cur) => {
    if (!acc[cur.class_type_id]) { acc[cur.class_type_id] = {}; }
    if (!acc[cur.class_type_id][cur.batch]) { acc[cur.class_type_id][cur.batch] = []; }
    acc[cur.class_type_id][cur.batch].push(cur);
    return acc;
  }, {});
  return exceptionDaysAll;
};

const getClassRoutinesAll = async () => {
  // get class_routine by class_type_id from DB
  const classesRoutinesRaw = await Class.getRoutines();
  // transfer classes routines data to object
  // format: {class_type_id: {weekday, start_time, end_time}
  const classRoutinesAll = classesRoutinesRaw.reduce((acc, cur) => {
    if (!acc[cur.class_type_id]) { acc[cur.class_type_id] = {}; }
    acc[cur.class_type_id][cur.weekday] = cur;
    return acc;
  }, {});
  return classRoutinesAll;
};

const getSearchRange = (from = dayjs().subtract(6, 'month'), to = dayjs()) => {
  const wantFrom = dayjs(from);
  const wantTo = dayjs(to);
  const defaultTo = dayjs(); // today()
  const defaultFrom = defaultTo.subtract(6, 'month'); // 6 months ago
  const searchFrom = (wantFrom.isBefore(defaultFrom)) ? defaultFrom : wantFrom;
  const searchTo = (wantTo.isAfter(defaultTo)) ? defaultTo : wantTo;
  const formattedFrom = searchFrom.format('YYYY-MM-DD');
  const formattedTo = searchTo.format('YYYY-MM-DD');
  return { from: formattedFrom, to: formattedTo };
};

const buildAttendanceTable = async (
  from,
  to,
  schoolDaysAll,
  classes,
  classesRoutinesAll,
  exceptionDaysAll,
) => {
  // get each class attendance templates
  const classAttendanceTemplates = classes.reduce((acc, clas) => {
    // get class search range
    const { classSearchFrom, classSearchTo } = getClassSearchRange(
      clas.start_date,
      clas.end_date,
      from,
      to,
    );
    // get school days for class
    const classSchoolDays = schoolDaysAll.filter((date) => date.date.isBetween(classSearchFrom, classSearchTo, 'day', '[]'))
      .map((date) => date.date.format('YYYY-MM-DD'));
    const classRoutines = classesRoutinesAll[clas.class_type_id];
    // get exception days for class
    const classExceptionDays = (exceptionDaysAll[clas.class_type_id][clas.batch])
      ? exceptionDaysAll[clas.class_type_id][clas.batch].filter(
        (date) => date.date.isBetween(classSearchFrom, classSearchTo, 'day', '[]'),
      ).map((date) => ({ date: date.date.format('YYYY-MM-DD'), start: date.start, end: date.end })) : [];
    const recordException = new Set(); // use Set to confirm there won't be >= 2 settings for 1 day
    let attendanceTemplates = [];
    // push exception days first
    classExceptionDays.forEach((exception) => {
      recordException.add(exception.date);
      attendanceTemplates.push(
        { date: exception.date, start: exception.start, end: exception.end },
      );
    });
    // then push normal school days
    classSchoolDays.forEach((schoolDay) => {
      // skip if there has been a excpetion setting
      if (recordException.has(schoolDay)) { return; }
      const day = dayjs(schoolDay).day();
      // need to punch date is school day in routine
      if (classRoutines[day]) {
        attendanceTemplates.push(
          {
            date: schoolDay,
            start: classRoutines[day].start_time,
            end: classRoutines[day].end_time,
          },
        );
      }
    });
    // due to exception day, need to sort by date
    attendanceTemplates = attendanceTemplates.sort((a, b) => (dayjs(b.date) - dayjs(a.date)));
    acc[clas.id] = attendanceTemplates;
    return acc;
  }, {});
  return classAttendanceTemplates;
};

const getClassPunches = async (classId, searchFrom, searchTo) => {
  const classPunchesRaw = await Attendance.getClassPunch(classId, searchFrom, searchTo);

  const classPunches = classPunchesRaw.reduce((acc, cur) => {
    const formattedPunch = JSON.parse(JSON.stringify(cur));
    const punch = [cur.punch_in, cur.punch_out];
    delete formattedPunch.punch_in;
    delete formattedPunch.punch_out;
    if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }

    if (!acc[cur.punch_date][cur.student_id]) {
      formattedPunch.punches = [punch];
      acc[cur.punch_date][cur.student_id] = formattedPunch;
    } else {
      acc[cur.punch_date][cur.student_id].punches.push(punch);
    }
    return acc;
  }, {});
  return { classId, classPunches };
};

const getPersonPunches = async (studentId, searchFrom, searchTo) => {
  const personPunchesRaw = await Attendance.getPersonPunch(studentId, searchFrom, searchTo);
  const personPunches = personPunchesRaw.reduce((acc, cur) => {
    const formattedPunch = JSON.parse(JSON.stringify(cur));
    const punch = [cur.punch_in, cur.punch_out];
    delete formattedPunch.punch_in;
    delete formattedPunch.punch_out;
    if (!acc[cur.punch_date]) { acc[cur.punch_date] = {}; }

    if (!acc[cur.punch_date][cur.student_id]) {
      formattedPunch.punches = [punch];
      acc[cur.punch_date][cur.student_id] = formattedPunch;
    } else {
      acc[cur.punch_date][cur.student_id].punches.push(punch);
    }
    return acc;
  }, {});
  return { personPunches };
};

const getClassLeaves = async (classId, searchFrom, searchTo) => {
  const classLeavesRaw = await Leave.getClassLeaves(classId, searchFrom, searchTo);

  const classLeaves = classLeavesRaw.reduce((acc, cur) => {
    const formattedLeave = JSON.parse(JSON.stringify(cur));
    const leave = [cur.start, cur.end, cur.approval, cur.need_calculate];
    delete formattedLeave.start;
    delete formattedLeave.end;
    if (!acc[cur.date]) { acc[cur.date] = {}; }
    if (!acc[cur.date][cur.student_id]) {
      formattedLeave.leaves = [leave];
      acc[cur.date][cur.student_id] = formattedLeave;
    } else {
      acc[cur.date][cur.student_id].leaves.push(leave);
    }
    return acc;
  }, {});
  return { classId, classLeaves };
};

const getPersonLeaves = async (studentId, searchFrom, searchTo) => {
  const personLeavesRaw = await Leave.getPersonLeaves(studentId, searchFrom, searchTo);

  const personLeaves = personLeavesRaw.reduce((acc, cur) => {
    const formattedLeave = JSON.parse(JSON.stringify(cur));
    const leave = [cur.start, cur.end, cur.approval, cur.need_calculate];
    delete formattedLeave.start;
    delete formattedLeave.end;
    if (!acc[cur.date]) { acc[cur.date] = {}; }
    if (!acc[cur.date][cur.student_id]) {
      formattedLeave.leaves = [leave];
      acc[cur.date][cur.student_id] = formattedLeave;
    } else {
      acc[cur.date][cur.student_id].leaves.push(leave);
    }
    return acc;
  }, {});
  return { personLeaves };
};

const getAttendanceTable = async (from, to) => {
  // 1 get all school days
  const schoolDaysAll = await Calendar.getSchoolDays(from, to);
  // 2 get all class info
  const classes = await Class.getClasses();
  // 3 get class routines
  const classesRoutinesAll = await getClassRoutinesAll();
  // 4 get exception date
  const exceptionDaysAll = await getExceptionDaysAll(from, to);
  const attendancesTemplates = await buildAttendanceTable(
    from,
    to,
    schoolDaysAll,
    classes,
    classesRoutinesAll,
    exceptionDaysAll,
  );

  return { attendancesTemplates, classes };
};

const attendanceAddDetail = (attendance, student, classesTable) => {
  const attendanceDetail = JSON.parse(JSON.stringify(attendance));
  // add student detail
  attendanceDetail.student_id = student.id;
  attendanceDetail.student_name = student.name;
  // add class detail
  attendanceDetail.class_type_id = classesTable[student.class_id].class_type_id;
  attendanceDetail.class_type_name = classesTable[student.class_id].class_type_name;
  attendanceDetail.class_group_id = classesTable[student.class_id].class_group_id;
  attendanceDetail.class_group_name = classesTable[student.class_id].class_group_name;
  attendanceDetail.batch = classesTable[student.class_id].batch;
  return attendanceDetail;
};

const getAtendance = (
  attendancesTemplates,
  targetStudents,
  classesTable,
  classesPunchesTable,
  classesLeavesTable,
) => {
  // get attendance status => fill in template
  let targetAttendances = [];
  targetStudents.forEach((student) => {
    const personAttendances = attendancesTemplates[student.class_id].map((dateRule) => {
      const studentsPunchOneDate = classesPunchesTable[student.class_id][dateRule.date];
      const studentsLeavesOneDate = classesLeavesTable[student.class_id][dateRule.date];
      const studentLeaves = (studentsLeavesOneDate && studentsLeavesOneDate[student.id])
        ? studentsLeavesOneDate[student.id].leaves : [];
      const studentPunches = (studentsPunchOneDate && studentsPunchOneDate[student.id])
        ? studentsPunchOneDate[student.id].punches : [];
      const attendance = checkAttendanceStatus(
        lunchBreakStart,
        lunchBreakEnd,
        dateRule.start,
        dateRule.end,
        studentPunches,
        studentLeaves,
      );

      const attendanceDetail = attendanceAddDetail(dateRule, student, classesTable);

      attendanceDetail.attendance = attendance;
      return attendanceDetail;
    });
    targetAttendances.push(personAttendances);
  });
  // 展開及排序
  targetAttendances = targetAttendances.flat();
  targetAttendances = targetAttendances.sort((b, a) => (dayjs(a.date) - dayjs(b.date)));

  return targetAttendances;
};

const getAllAttendances = async (wantFrom, wantTo) => {
  try {
    const { from, to } = getSearchRange(wantFrom, wantTo);
    const { attendancesTemplates, classes } = await getAttendanceTable(from, to);
    const classesTable = classes.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});
    // get students list
    const targetStudentsRaw = await Promise.all(classes.map(
      async (clas) => User.getStudents(clas.id),
    ));
    const targetStudents = targetStudentsRaw.flat();
    // get all punches group by class
    const classesPunches = await Promise.all(classes.map(
      async (clas) => getClassPunches(clas.id, from, to),
    ));
    const classesPunchesTable = classesPunches.reduce((acc, cur) => {
      acc[cur.classId] = cur.classPunches;
      return acc;
    }, {});
    // get all leavees group by class
    const classesLeaves = await Promise.all(classes.map(
      async (clas) => getClassLeaves(clas.id, from, to),
    ));
    const classesLeavesTable = classesLeaves.reduce((acc, cur) => {
      acc[cur.classId] = cur.classLeaves;
      return acc;
    }, {});

    const attendances = getAtendance(
      attendancesTemplates,
      targetStudents,
      classesTable,
      classesPunchesTable,
      classesLeavesTable,
    );
    return { code: 1000, data: attendances };
  } catch (error) {
    return new GeneralError(2000, error.message);
  }
};

const getClassAttendances = async (classId, wantFrom, wantTo) => {
  try {
    const { from, to } = getSearchRange(wantFrom, wantTo);
    const { attendancesTemplates, classes } = await getAttendanceTable(from, to);
    const classesTable = classes.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    const targetStudents = await User.getStudents(classId);
    const { classPunches } = await getClassPunches(classId, from, to);
    const classPunchesTable = {};
    classPunchesTable[classId] = classPunches;
    const { classLeaves } = await getClassLeaves(classId);
    const classLeavesTable = {};
    classLeavesTable[classId] = classLeaves;

    const attendances = getAtendance(
      attendancesTemplates,
      targetStudents,
      classesTable,
      classPunchesTable,
      classLeavesTable,
    );
    return { code: 1000, data: attendances };
  } catch (error) {
    return new GeneralError(2000, error.message);
  }
};

const getPersonAttendances = async (studentId, wantFrom, wantTo) => {
  try {
    const { from, to } = getSearchRange(wantFrom, wantTo);
    const { attendancesTemplates, classes } = await getAttendanceTable(from, to);
    const classesTable = classes.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    const targetStudent = await User.getOneStudent(studentId);
    const classId = targetStudent.class_id;
    const { personPunches } = await getPersonPunches(studentId, from, to);
    // const { classPunches } = await getClassPunches(classId, from, to);

    const classPunchesTable = {};
    classPunchesTable[classId] = personPunches;
    const { personLeaves } = await getPersonLeaves(studentId);
    const classLeavesTable = {};
    classLeavesTable[classId] = personLeaves;

    const attendances = getAtendance(
      attendancesTemplates,
      [targetStudent],
      classesTable,
      classPunchesTable,
      classLeavesTable,
    );
    return { code: 1000, data: attendances };
  } catch (error) {
    return new GeneralError(2000, error.message);
  }
};

module.exports = { getAllAttendances, getClassAttendances, getPersonAttendances };
