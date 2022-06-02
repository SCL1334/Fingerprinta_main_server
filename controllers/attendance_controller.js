const dayjs = require('dayjs');
const Attendance = require('../models/attendance_model');
const AttendanceService = require('../service/attendance_service');
const User = require('../models/user_model');
const ResponseTransformer = require('../util/response');
const { GeneralError } = require('../util/custom_error');

const setPunch = async (req, res) => {
  const sensorIp = process.env.FINGERPRINT_HOST;
  const requestIp = req.connection.remoteAddress;
  // reqIp Ipv4 ::1 / Ipv6 ::ffff:127.0.0.1
  const reqIpDevide = requestIp.split(':');
  // get last part od reqIp
  if (sensorIp !== reqIpDevide[reqIpDevide.length - 1]) { return res.status(403).json({ error: { message: 'Only sensor server can punch' } }); }
  const { fingerId } = req.params;
  const studentId = await User.findByFinger(fingerId);

  const punchResult = await Attendance.setPunch(studentId);
  if (punchResult === 1) {
    return res.status(200).json({ data: { code: 1010, message: 'Punch in successfully' } });
  }
  if (punchResult === 2) {
    return res.status(200).json({ data: { code: 1010, message: 'Punch out successfully' } });
  }
  if (punchResult === -1) {
    return res.status(400).json({ error: { code: 3010, message: 'Punch failed due to invalid input' } });
  }
  return res.status(500).json({ error: { code: 2010, message: 'Punch failed due to internal server error' } });
};

const getAllPunch = async (req, res) => {
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: 'Input lack of parameter' });
  }
  const punches = await Attendance.getAllPunch(from, to);
  if (punches instanceof Error) {
    return res.status(500).json({ error: { message: 'Read failed' } });
  }
  return res.status(200).json({ data: punches });
};

const getClassPunch = async (req, res) => {
  const classId = req.params.id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: 'Input lack of parameter' });
  }
  const punches = await Attendance.getClassPunch(classId, from, to);
  if (punches instanceof Error) {
    return res.status(500).json({ error: { message: 'Read failed' } });
  }
  return res.status(200).json({ data: punches });
};

const getPersonPunch = async (req, res) => {
  const studentId = req.params.id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: 'Input lack of parameter' });
  }
  const punches = await Attendance.getPersonPunch(studentId, from, to);
  if (punches instanceof Error) {
    return res.status(500).json({ error: { message: 'Read failed' } });
  }
  return res.status(200).json({ data: punches });
};

const getSelfPunch = async (req, res) => {
  const studentId = req.session.user.student_id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: 'Input lack of parameter' });
  }
  const punches = await Attendance.getPersonPunch(studentId, from, to);
  if (punches instanceof Error) {
    return res.status(500).json({ error: { message: 'Read failed' } });
  }
  return res.status(200).json({ data: punches });
};

const getPersonAttendances = async (req, res) => {
  const studentId = req.params.id;
  let { from, to } = req.query;

  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    const transformer = new ResponseTransformer(new GeneralError(3003, 'Input lack of parameter or invalid date'));
    return res.status(transformer.httpCode).json(transformer.response);
  } else {
    from = undefined;
    to = undefined;
  }

  const result = await AttendanceService.getPersonAttendances(studentId, from, to);
  const transformer = new ResponseTransformer(result);
  return res.status(transformer.httpCode).json(transformer.response);
};

const getSelfAttendances = async (req, res) => {
  const studentId = req.session.user.student_id;
  let { from, to } = req.query;

  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    const transformer = new ResponseTransformer(new GeneralError(3003, 'Input lack of parameter or invalid date'));
    return res.status(transformer.httpCode).json(transformer.response);
  } else {
    from = undefined;
    to = undefined;
  }

  const result = await AttendanceService.getPersonAttendances(studentId, from, to);
  const transformer = new ResponseTransformer(result);
  return res.status(transformer.httpCode).json(transformer.response);
};

const getClassAttendances = async (req, res) => {
  const classId = req.params.id;
  let { from, to } = req.query;

  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    const transformer = new ResponseTransformer(new GeneralError(3003, 'Input lack of parameter or invalid date'));
    return res.status(transformer.httpCode).json(transformer.response);
  } else {
    from = undefined;
    to = undefined;
  }

  const result = await AttendanceService.getClassAttendances(classId, from, to);
  const transformer = new ResponseTransformer(result);
  return res.status(transformer.httpCode).json(transformer.response);
};

const getAllAttendances = async (req, res) => {
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    const transformer = new ResponseTransformer(new GeneralError(3003, 'Input lack of parameter or invalid date'));
    return res.status(transformer.httpCode).json(transformer.response);
  } else {
    from = undefined;
    to = undefined;
  }

  const result = await AttendanceService.getAllAttendances(from, to);
  const transformer = new ResponseTransformer(result);
  return res.status(transformer.httpCode).json(transformer.response);
};

module.exports = {
  setPunch,
  getAllPunch,
  getClassPunch,
  getPersonPunch,
  getPersonAttendances,
  getClassAttendances,
  getAllAttendances,
  getSelfPunch,
  getSelfAttendances,
};
