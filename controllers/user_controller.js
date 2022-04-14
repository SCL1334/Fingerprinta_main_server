const User = require('../models/user_model');
const Fingerprint = require('../models/fingerprint_model');

const createStudent = async (req, res) => {
  const {
    name, account, password, class_id,
  } = req.body;

  const result = await User.createStudent(name, account, password, class_id);
  if (result === 0) {
    return res.status(500).json({ error: 'Create failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Create failed due to invalid input' });
  }
  return res.status(200).json({ data: 'Create successfully' });
};

const getStudents = async (req, res) => {
  const students = await User.getStudents();
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
    name, account, password,
  } = req.body;

  const result = await User.createStaff(name, account, password);
  if (result === 0) {
    return res.status(500).json({ error: 'Create failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Create failed due to invalid input' });
  }
  return res.status(200).json({ data: 'Create successfully' });
};

const getStaffs = async (req, res) => {
  const staffs = await User.getStaffs();
  if (staffs) {
    res.status(200).json({ data: staffs });
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
  req.session.email = email;
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
  req.session.email = email;
  return res.status(200).json({ data: 'Signin successfully' });
};

// maybe put in other route
const signOut = async (req, res) => {
  req.session.account = null;
  return res.json({ data: 'delete session' });
};

const getProfile = async (req, res) => {
  const { account } = req.session;
  if (!account) { return res.status(401).json({ error: 'Unauthorized' }); }
  const profile = await User.getProfile(account);
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
  deleteStaff,
  studentSignIn,
  staffSignIn,
  signOut,
  getProfile,
  matchFingerprint,
};
