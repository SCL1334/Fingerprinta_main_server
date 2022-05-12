const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');
const { getStudentProfile, studentChangePassword, signOut } = require('../controllers/user_controller');
const { getSelfPunch, getSelfAttendances } = require('../controllers/attendance_controller');
const {
  getTypes,
  applyLeave,
  getSelfLeaves,
  countSelfLeavesHours,
  updateSelfLeave,
  deleteSelfLeave,
  getSelfS3UrlForCertificate,
} = require('../controllers/leave_controller');

// clear session
router.route('/signout').post(wrapAsync(signOut));
router.route('/students/password').put(Validator.changePassword, wrapAsync(studentChangePassword));
router.route('/leaves/types').get(wrapAsync(getTypes));
router.route('/students/profile').get(wrapAsync(getStudentProfile));
router.route('/my/punches').get(wrapAsync(getSelfPunch));
router.route('/my/attendances').get(wrapAsync(getSelfAttendances));
router.route('/my/leaves/hours').get(wrapAsync(countSelfLeavesHours));
router.route('/my/leaves').get(wrapAsync(getSelfLeaves));
router.route('/my/leaves').post(Validator.createSelfLeave, wrapAsync(applyLeave));
router.route('/my/s3url').get(wrapAsync(getSelfS3UrlForCertificate));
router.route('/my/leaves/:id').put(Validator.editSelfLeave, wrapAsync(updateSelfLeave));
router.route('/my/leaves/:id').delete(wrapAsync(deleteSelfLeave));

module.exports = router;
