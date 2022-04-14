const Attendance = require('../models/attendance_model');
const User = require('../models/user_model');

const setPunch = async (req, res) => {
  const { fingerId } = req.params;
  const studentId = await User.findByFinger(fingerId);
  const punchResult = await Attendance.setPunch(studentId);
  if (punchResult === 1) {
    res.status(200).json({ data: 'Punch in successfully' });
  } else if (punchResult === 2) {
    res.status(200).json({ data: 'Punch out successfully' });
  } else if (punchResult === -1) {
    res.status(400).json({ error: 'Punch failed due to invalid input' });
  } else if (punchResult === 0) {
    res.status(500).json({ error: 'Punch failed due to internal server error' });
  }
};

const getPunch = async (req, res) => {
  let attendances;
  const studentId = req.query.student_id;
  const classId = req.query.class_id;
  if (studentId && classId) { return res.status(400).json({ error: 'Invalid search' }); }
  if (studentId) {
    attendances = await Attendance.getPersonPunch(studentId);
    return res.status(200).json({ data: attendances });
  }
  if (classId) {
    attendances = await Attendance.getClassPunch(classId);
    return res.status(200).json({ data: attendances });
  }
  attendances = await Attendance.getPunchAll();
  if (!attendances) {
    res.status(500).json({ error: 'Read failed' });
  } else {
    res.status(200).json({ data: attendances });
  }
};

module.exports = {
  setPunch, getPunch,
};
