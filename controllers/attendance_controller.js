const Attendance = require('../models/attendance_model');

const setPunch = async (req, res) => {
  const studentId = req.body.fpId;
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

module.exports = {
  setPunch,
};
