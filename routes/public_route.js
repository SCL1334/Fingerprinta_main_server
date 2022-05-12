const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');

const {
  studentSignIn,
  studentGetResetUrl, studentResetPassword,
  staffSignIn,
  staffGetResetUrl, staffResetPassword,

} = require('../controllers/user_controller');

const { setPunch } = require('../controllers/attendance_controller');

// for sensor server post
router.route('/students/fingerprint/:fingerId/punches').post(wrapAsync(setPunch));
// user before signin
router.route('/students/signin').post(Validator.signInInput, wrapAsync(studentSignIn));
router.route('/students/forget').post(Validator.applyResetPassword, wrapAsync(studentGetResetUrl));
router.route('/students/reset').post(Validator.resetPassword, wrapAsync(studentResetPassword));

router.route('/staffs/signin').post(Validator.signInInput, wrapAsync(staffSignIn));
router.route('/staffs/forget').post(Validator.applyResetPassword, wrapAsync(staffGetResetUrl));
router.route('/staffs/reset').post(Validator.resetPassword, wrapAsync(staffResetPassword));

module.exports = router;
