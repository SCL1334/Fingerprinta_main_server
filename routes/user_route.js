const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  createStudent, getStudents, deleteStudent, studentSignIn,
  createStaff, getStaffs, deleteStaff, staffSignIn,
  signOut,
  getStudentProfile, getStaffProfile,
  matchFingerprint,
} = require('../controllers/user_controller');

const {
  setPunch, getAllPunch, getPersonPunch, getPersonAttendances, getAllAttendances,
} = require('../controllers/attendance_controller');

const { getClasses } = require('../controllers/class_controller');

const {
  applyLeave, getAllLeaves, getPersonLeaves, countLeavesHours, transferLackAttendance,
} = require('../controllers/leave_controller');

router.route('/students/profile').get(wrapAsync(getStudentProfile));
router.route('/students/attendances').get(wrapAsync(getAllAttendances));
router.route('/students/leaves').get(wrapAsync(getAllLeaves));
router.route('/students/:id/leaves').get(wrapAsync(getPersonLeaves));
router.route('/students/:id/leaves').post(wrapAsync(applyLeave));
router.route('/students/:id/leaves/hours').get(wrapAsync(countLeavesHours));
router.route('/students/:id/attendances').get(wrapAsync(getPersonAttendances));
router.route('/students/:id/attendances/leaves').post(wrapAsync(transferLackAttendance));

router.route('/students/:id/fingerprint').post(wrapAsync(matchFingerprint));
router.route('/students/fingerprint/:fingerId/punches').post(wrapAsync(setPunch));
router.route('/students/signin').post(wrapAsync(studentSignIn));
router.route('/students').post(wrapAsync(createStudent));
router.route('/students').get(wrapAsync(getStudents));
router.route('/students/:id').delete(wrapAsync(deleteStudent));

router.route('/teachers/:id/classes').get(wrapAsync(getClasses));

router.route('/staffs/profile').get(wrapAsync(getStaffProfile));
router.route('/staffs/signin').post(wrapAsync(staffSignIn));
router.route('/staffs').post(wrapAsync(createStaff));
router.route('/staffs').get(wrapAsync(getStaffs));
router.route('/staffs/:id').delete(wrapAsync(deleteStaff));

// clear session
router.route('/signout').post(wrapAsync(signOut));

module.exports = router;
