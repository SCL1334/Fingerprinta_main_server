const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');
const {
  createStudent, editStudent, getStudents, getOneStudent, deleteStudent,
  createStaff, getStaffs, deleteStaff,
  staffChangePassword,
  getStaffProfile,
  matchFingerprint, initFingerData,
} = require('../controllers/user_controller');

const {
  getAllPunch, getPersonPunch, getPersonAttendances, getAllAttendances,
} = require('../controllers/attendance_controller');

const { getClasses } = require('../controllers/class_controller');

const { getS3UrlForCertificate } = require('../controllers/leave_controller');

const {
  applyLeave, getAllLeaves, getPersonLeaves,
  countLeavesHours, countAllLeavesHours, transferLackAttendance,
} = require('../controllers/leave_controller');

router.route('/students/:id/s3url').get(wrapAsync(getS3UrlForCertificate));
router.route('/students/attendances').get(wrapAsync(getAllAttendances));
router.route('/students/leaves').get(wrapAsync(getAllLeaves));
router.route('/students/:id/leaves').get(wrapAsync(getPersonLeaves));
// move to my route
// router.route('/students/:id/leaves').post(Validator.createStudentLeave, wrapAsync(applyLeave));
router.route('/students/:id/leaves/hours').get(wrapAsync(countLeavesHours));
router.route('/students/leaves/hours').get(wrapAsync(countAllLeavesHours));
router.route('/students/:id/punches').get(wrapAsync(getPersonPunch));
router.route('/students/:id/attendances').get(wrapAsync(getPersonAttendances));
router.route('/students/:id/attendances/leaves').post(Validator.createStudentLeave, wrapAsync(transferLackAttendance));

router.route('/students/:id/fingerprint').post(wrapAsync(matchFingerprint));

router.route('/students/fingerprint/:id').delete(wrapAsync(initFingerData));

router.route('/students').post(Validator.createStudent, wrapAsync(createStudent));
router.route('/students').get(wrapAsync(getStudents));
router.route('/students/:id').get(wrapAsync(getOneStudent));
router.route('/students/:id').put(Validator.editStudent, wrapAsync(editStudent));
router.route('/students/:id').delete(wrapAsync(deleteStudent));

router.route('/teachers/:id/classes').get(wrapAsync(getClasses));

router.route('/staffs/profile').get(wrapAsync(getStaffProfile));

router.route('/staffs/password').put(Validator.changePassword, wrapAsync(staffChangePassword));

router.route('/staffs').post(Validator.createStaff, wrapAsync(createStaff));
router.route('/staffs').get(wrapAsync(getStaffs));
router.route('/staffs/:id').delete(wrapAsync(deleteStaff));

module.exports = router;
