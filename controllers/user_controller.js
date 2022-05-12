const User = require('../models/user_model');
const Fingerprint = require('../models/fingerprint_model');
const { sendResetEmail } = require('../util/mailer');

const createStudent = async (req, res) => {
  const {
    name, email, password, class_id: classId,
  } = res.locals.student;

  const result = await User.createStudent(name, email, password, classId);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const createClassStudents = async (req, res) => {
  const classId = req.params.id;
  const { students } = req.body;
  const result = await User.createClassStudents(students, classId);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const editStudent = async (req, res) => {
  const { id, student } = res.locals;

  const status = await User.editStudent(id, student);
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
  } = res.locals.staff;

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
  const { email, password } = res.locals.signIn;
  const result = await User.studentSignIn(email, password);
  if (result.code === 1010) {
    req.session.user = { student_id: result.student_id };
    return res.status(200).json({ data: { message: 'Signin successfully' } });
  }
  if (result.code === 2010) {
    return res.status(500).json({ error: { message: result.message } });
  }
  return res.status(400).json({ error: { message: result.message } });
};

const studentChangePassword = async (req, res) => {
  const role = 'student';
  const { user } = req.session;
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }
  const { email } = user;
  const { password, new_password: newPassword } = res.locals.passwords;
  const result = await User.changePassword(role, email, password, newPassword);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Update password successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Update password failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Update password failed due to invalid input' } });
  }
};

const studentGetResetUrl = async (req, res) => {
  const role = 'student';
  const { email } = res.locals;
  const student = await User.getStudentProfile(email);
  if (!student) { return res.status(400).json({ code: 4000, error: { message: 'User does not exist' } }); }
  const setHash = await User.setHashedMail(email);
  if (setHash.code !== 1010) { return res.status(500).json({ code: setHash.code, error: { message: 'Fail to reset' } }); }
  const result = await sendResetEmail(role, student.name, student.email, setHash.data.hash);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Mail has been send successfully' } });
  }
  return res.status(500).json({ code: result.code, error: { message: 'Failt to send mail' } });
};

const studentResetPassword = async (req, res) => {
  const role = 'student';
  const hash = req.query.apply;
  const newPassword = res.locals.password;
  const getEmail = await User.getMailByHash(hash);
  if (getEmail.code >= 2000) { return res.status(500).json({ code: getEmail.code, error: { message: 'Fail to get data' } }); }
  const { email } = getEmail.data;
  if (!email) { return res.status(400).json({ code: 4000, error: { message: 'Request expired' } }); }
  const result = await User.resetPassword(role, email, newPassword);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Reset password successfully' } });
  }
  if (result.code < 3000) {
    return res.status(500).json({ code: result.code, error: { message: 'Reset password failed' } });
  }
  return res.status(400).json({ code: result.code, error: { message: 'Reset password failed due to invalid input' } });
};

const staffSignIn = async (req, res) => {
  const { email, password } = res.locals.signIn;
  const result = await User.staffSignIn(email, password);
  if (result.code === 1010) {
    req.session.user = { staff_id: result.staff_id };
    return res.status(200).json({ data: { message: 'Signin successfully' } });
  }
  if (result.code === 2010) {
    return res.status(500).json({ error: { message: result.message } });
  }
  return res.status(400).json({ error: { message: result.message } });
};

const staffChangePassword = async (req, res) => {
  const role = 'staff';
  const { user } = req.session;
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }
  const { email } = user;
  const { password, new_password: newPassword } = res.locals.passwords;
  const result = await User.changePassword(role, email, password, newPassword);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Update password successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Update password failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Update password failed due to invalid input' } });
  }
};

const staffGetResetUrl = async (req, res) => {
  const role = 'staff';
  const { email } = res.locals;
  const staff = await User.getStaffProfile(email);
  if (!staff) { return res.status(400).json({ code: 4000, error: { message: 'User does not exist' } }); }
  const setHash = await User.setHashedMail(email);
  if (setHash.code !== 1010) { return res.status(500).json({ code: setHash.code, error: { message: 'Fail to reset' } }); }
  const result = await sendResetEmail(role, staff.name, staff.email, setHash.data.hash);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Mail has been send successfully' } });
  }
  return res.status(500).json({ code: result.code, error: { message: 'Failt to send mail' } });
};

const staffResetPassword = async (req, res) => {
  const role = 'staff';
  const hash = req.query.apply;
  const newPassword = res.locals.password;
  const getEmail = await User.getMailByHash(hash);
  if (getEmail.code >= 2000) { return res.status(500).json({ code: getEmail.code, error: { message: 'Fail to get data' } }); }
  const { email } = getEmail.data;
  if (!email) { return res.status(400).json({ code: 4000, error: { message: 'Request expired' } }); }
  const result = await User.resetPassword(role, email, newPassword);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Reset password successfully' } });
  }
  if (result.code < 3000) {
    return res.status(500).json({ code: result.code, error: { message: 'Reset password failed' } });
  }
  return res.status(400).json({ code: result.code, error: { message: 'Reset password failed due to invalid input' } });
};

// maybe put in other route
const signOut = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: { message: 'delete session failed' } });
    }
    return res.status(200).json({ data: { message: 'delete session successfully' } });
  });
};

const getStudentProfile = async (req, res) => {
  const { user } = req.session;
  if (!user || !user.student_id) { return res.status(401).json({ error: 'Unauthorized' }); }
  const profile = await User.getStudentProfile(user.student_id);
  return res.status(200).json({ data: profile });
};

const getOneStudent = async (req, res) => {
  const studentId = req.params.id;
  const profile = await User.getOneStudent(studentId);
  if (profile) {
    res.status(200).json({ data: profile });
  } else { res.status(500).json({ error: { message: 'Get data failed' } }); }
};

const getStaffProfile = async (req, res) => {
  const { user } = req.session;
  if (!user) { return res.status(401).json({ error: 'Unauthorized' }); }
  if (!user.staff_id) { return res.status(403).json({ error: { message: 'Forbidden' } }); }

  const profile = await User.getStaffProfile(user.staff_id);
  return res.status(200).json({ data: profile });
};

const matchFingerprint = async (req, res) => {
  const studentId = req.params.id;
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
  // get student id
  const fingerIds = await Fingerprint.getAvailableId();
  // internal error
  if (fingerIds === null) { res.status(500).json({ code: 2020, error: { message: 'Match failed, Internal server error' } }); }
  // no fingerprint id
  if (fingerIds.length === 0) {
    return res.status(400).json({
      code: 4444,
      error: {
        message: 'All fingerprint ID has been used OR table has not been init',
      },
    });
  }

  // pick a ID to use
  const fingerId = fingerIds[0].id;

  const retryEnrollStatus = async (cur, limit) => {
    const enrollStatus = await Fingerprint.matchStudent(studentId, fingerId);
    if (enrollStatus.code < 2000) {
      return enrollStatus;
    }
    if (cur >= limit) { return enrollStatus; }
    // before retry init fist
    await Fingerprint.deleteOneSensorFinger(fingerId);
    await Fingerprint.initOneRow(fingerId);
    return retryEnrollStatus(cur + 1, limit);
  };

  // send to sensor
  const tryLimit = 3;
  const tryTime = 1;
  const result = await retryEnrollStatus(tryTime, tryLimit);

  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { finger_id: result.finger_id, message: 'Match successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Match failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: result.message || 'Match failed due to invalid input' } });
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
  createClassStudents,
  editStudent,
  getStudents,
  getOneStudent,
  deleteStudent,
  createStaff,
  getStaffs,
  getClassTeachers,
  deleteStaff,
  studentSignIn,
  studentChangePassword,
  studentResetPassword,
  studentGetResetUrl,
  staffSignIn,
  staffChangePassword,
  staffGetResetUrl,
  staffResetPassword,
  signOut,
  getStudentProfile,
  getStaffProfile,
  matchFingerprint,
  initFingerData,
};
