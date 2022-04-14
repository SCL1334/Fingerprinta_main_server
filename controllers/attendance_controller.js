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

const getAllPunch = async (req, res) => {
  const punches = await Attendance.getAllPunch();
  if (!punches) {
    res.status(500).json({ error: 'Read failed' });
  } else {
    res.status(200).json({ data: punches });
  }
};

const getClassPunch = async (req, res) => {
  const classId = req.params.id;
  const punches = await Attendance.getClassPunch(classId);
  if (!punches) {
    res.status(500).json({ error: 'Read failed' });
  } else {
    res.status(200).json({ data: punches });
  }
};

const getPersonPunch = async (req, res) => {
  const studentId = req.params.id;
  const punches = await Attendance.getPersonPunch(studentId);
  if (!punches) {
    res.status(500).json({ error: 'Read failed' });
  } else {
    res.status(200).json({ data: punches });
  }
};

module.exports = {
  setPunch, getAllPunch, getClassPunch, getPersonPunch,
};
