const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
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
} = require('../controllers/user_controller');

router.route('students/profile').get(wrapAsync(getProfile));
router.route('/students/:id/fingerprint').post(wrapAsync(matchFingerprint));

router.route('/students/signin').post(wrapAsync(studentSignIn));
router.route('/students').post(wrapAsync(createStudent));
router.route('/students').get(wrapAsync(getStudents));
router.route('/students/:id').delete(wrapAsync(deleteStudent));

router.route('/staffs/signin').post(wrapAsync(staffSignIn));
router.route('/staffs').post(wrapAsync(createStaff));
router.route('/staffs').get(wrapAsync(getStaffs));
router.route('/staffs/:id').delete(wrapAsync(deleteStaff));
// clear session
router.route('/signout').post(wrapAsync(signOut));

module.exports = router;
