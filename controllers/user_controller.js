const User = require('../models/user_model');
const Fingerprint = require('../models/fingerprint_model');
const { sendResetEmail } = require('../util/mailer');

const studentGetResetUrl = async (req, res) => {
  const { email } = req.body;
  const student = await User.getStudentProfile(email);
  const result = await sendResetEmail(student.name, student.email, 'http://127.0.0.1:3000/student_signin.html');
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Mail has been send successfully' } });
  } else {
    res.status(500).json({ code: result.code, error: { message: 'Failt to send mail' } });
  }
};

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

const editStudent = async (req, res) => {
  const studentId = req.params.id;
  const { name, email, class_id: classId } = req.body;
  const student = { name, email, class_id: classId };

  console.log(student);

  // remove blank value
  Object.keys(student).forEach((key) => {
    if (student[key] === undefined) {
      delete student[key];
    }
  });

  const status = await User.editStudent(studentId, student);
  if (status.code < 2000) {
    res.status(200).json({ code: status.code, data: { message: 'Update successfully' } });
  } else if (status.code < 3000) {
    res.status(500).json({ code: status.code, error: { message: 'Update failed' } });
  } else {
    res.status(400).json({ code: status.code, error: { message: 'Update failed due to invalid input' } });
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

const studentChangePassword = async (req, res) => {
  const { user } = req.session;
  const { email } = user;
  const { password, new_password: newPassword } = req.body;
  const result = await User.studentChangePassword(email, password, newPassword);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Update password successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Update password failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Update password failed due to invalid input' } });
  }
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
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }
  const profile = await User.getStudentProfile(user.email);
  res.status(200).json({ data: profile });
};

const getStaffProfile = async (req, res) => {
  const { user } = req.session;
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }
  if (user.role !== 'staff') { return res.status(403).json({ error: { message: 'Forbidden' } }); }

  const profile = await User.getStaffProfile(user.email);
  res.status(200).json({ data: profile });
};

const matchFingerprint = async (req, res) => {
  const { studentId } = req.params;
  const { fingerId } = req.params;
  // check student exist
  const studentExist = await User.getOneStudent(studentId);
  if (!studentExist) { return res.status(400).json({ code: 4000, error: { message: 'Student not exist' } }); }
  // check student has registered
  const studentRegister = await Fingerprint.checkStudentEnroll(studentId);
  if (studentRegister.length !== 0) {
    return res.status(400).json({
      code: 4021,
      error: {
        message:
        'student has registered',
      },
    });
  }
  // check if finger Id has been used
  const pair = await Fingerprint.findStudent(fingerId);
  // internal error
  if (pair === null) { res.status(500).json({ code: 2020, error: { message: 'Match failed, Internal server error' } }); }
  // no fingerprint id
  // sensor hardware doesn't fit software => finger_id >= 200
  if (pair.length === 0) {
    return res.status(400).json({
      code: 4444,
      error: {
        message: 'finger id over origin sensor hardware limit OR table has not been init',
      },
    });
  }
  // has been paired with a student
  if (pair[0].student_id) {
    return res.status(400).json({
      code: 4022,
      error: {
        message:
        `finger_id has been used by student_id: ${pair[0].student_id}`,
      },
    });
  }
  // no student pair but status wrong => better clean both sensor and server data
  if (pair[0].status !== 0) {
    res.status(500).json({ code: 2444, error: { message: 'status wrong, need to clear the finger id' } });
  }

  // send to sensor
  const enrollStatus = await Fingerprint.enrollId(fingerId);
  console.log(enrollStatus);
  if (enrollStatus.code > 3000) {
    return res.status(400).json({
      code: enrollStatus.code,
      error: { message: enrollStatus.message },
    });
  }

  if (enrollStatus.code > 2000) {
    res.status(500).json({ code: enrollStatus, error: { message: 'Match failed due to sensor issue' } });
  }
  // valid student and valid fingerprint
  const result = await Fingerprint.matchStudent(fingerId, studentId);

  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { finger_id: result.finger_id, message: 'Match successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Match failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Match failed due to invalid input' } });
  }
};

const initFingerData = async (req, res) => {
  const fingerId = req.params.id;
  // sensor record 0-199
  if (fingerId >= 200) { return res.status(400).json({ code: 3040, error: { message: 'finger Id out of range' } }); }
  const initRowStatus = await Fingerprint.initOneRow(fingerId);
  if (initRowStatus.code > 2000) { return res.status(500).json({ code: initRowStatus.code, error: { message: 'Internal server Errors' } }); }
  const deleteSensorFingerStatus = await Fingerprint.deleteOneSensorFinger(fingerId);
  if (deleteSensorFingerStatus.code > 2000 || (!deleteSensorFingerStatus.code)) { return res.status(500).json({ code: initRowStatus.code, error: { message: 'Sensor Errors' } }); }
  return res.status(200).json({ data: { message: 'Delete successfully' } });
};

module.exports = {
  createStudent,
  editStudent,
  getStudents,
  deleteStudent,
  createStaff,
  getStaffs,
  getClassTeachers,
  deleteStaff,
  studentSignIn,
  studentChangePassword,
  studentGetResetUrl,
  staffSignIn,
  signOut,
  getStudentProfile,
  getStaffProfile,
  matchFingerprint,
  initFingerData,
};
