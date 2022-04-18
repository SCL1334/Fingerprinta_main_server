const User = require('../models/user_model');
const Fingerprint = require('../models/fingerprint_model');

const createStudent = async (req, res) => {
  const {
    name, email, password, class_id,
  } = req.body;

  const result = await User.createStudent(name, email, password, class_id);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const getStudents = async (req, res) => {
  const classId = req.params.id;
  const students = await User.getStudents(classId);
  if (students) {
    res.status(200).json({ data: students });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const deleteStudent = async (req, res) => {
  const studentId = req.params.id;
  const result = await User.deleteStudent(studentId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

const createStaff = async (req, res) => {
  const {
    name, email, password,
  } = req.body;

  const result = await User.createStaff(name, email, password);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const getStaffs = async (req, res) => {
  const staffs = await User.getStaffs();
  if (staffs) {
    res.status(200).json({ data: staffs });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const getClassTeachers = async (req, res) => {
  const classId = req.params.id;
  const teachers = await User.getClassTeachers(classId);
  if (teachers) {
    res.status(200).json({ data: teachers });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const deleteStaff = async (req, res) => {
  const staffId = req.params.id;
  const result = await User.deleteStaff(staffId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

const studentSignIn = async (req, res) => {
  const { email, password } = req.body;
  const result = await User.studentSignIn(email, password);
  if (result === 0) {
    return res.status(500).json({ error: 'Signin failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Signin failed due to invalid input' });
  }
  req.session.user = { role: 'student', email };
  return res.status(200).json({ data: 'Signin successfully' });
};

const staffSignIn = async (req, res) => {
  const { email, password } = req.body;
  const result = await User.staffSignIn(email, password);
  if (result === 0) {
    return res.status(500).json({ error: 'Signin failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Signin failed due to invalid input' });
  }
  req.session.user = { role: 'staff', email };
  return res.status(200).json({ data: 'Signin successfully' });
};

// maybe put in other route
const signOut = async (req, res) => {
  req.session.account = null;
  return res.json({ data: 'delete session' });
};

const getStudentProfile = async (req, res) => {
  const { user } = req.session;
  const { email } = user;
  if (!email) { return res.status(401).json({ error: 'Unauthorized' }); }
  const profile = await User.getStudentProfile(email);
  res.status(200).json({ data: profile });
};

const getStaffProfile = async (req, res) => {
  const { user } = req.session;
  const { email } = user;
  if (!email) { return res.status(401).json({ error: 'Unauthorized' }); }
  if (user.role !== 'staff') { return res.status(403).json({ error: { message: 'Forbidden' } }); }

  const profile = await User.getStaffProfile(email);
  res.status(200).json({ data: profile });
};

const matchFingerprint = async (req, res) => {
  const studentId = req.params.id;
  const fingerId = await Fingerprint.getEnrollId();
  if (fingerId === -1) {
    return res.status(400).json({ error: 'Match failed due to enroll failed' });
  }
  if (fingerId === -2) {
    res.status(500).json({ error: 'Match failed due to sensor disconnect' });
  }
  const result = await User.matchFingerprint(studentId, fingerId);
  if (result === 0) {
    return res.status(500).json({ error: 'Match failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Match failed due to invalid input' });
  }
  return res.status(200).json({ data: 'Match OK' });
};

module.exports = {
  createStudent,
  getStudents,
  deleteStudent,
  createStaff,
  getStaffs,
  getClassTeachers,
  deleteStaff,
  studentSignIn,
  staffSignIn,
  signOut,
  getStudentProfile,
  getStaffProfile,
  matchFingerprint,
};
