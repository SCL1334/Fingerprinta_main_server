const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');
const { getSelfPunch, getSelfAttendances } = require('../controllers/attendance_controller');
const {
  applyLeave,
  getSelfLeaves,
  countSelfLeavesHours,
  updateSelfLeave,
  deleteSelfLeave,
  getSelfS3UrlForCertificate,
} = require('../controllers/leave_controller');

router.route('/my/punches').get(wrapAsync(getSelfPunch));
router.route('/my/attendances').get(wrapAsync(getSelfAttendances));
router.route('/my/leaves/hours').get(wrapAsync(countSelfLeavesHours));
router.route('/my/leaves').get(wrapAsync(getSelfLeaves));
router.route('/my/leaves').post(Validator.createSelfLeave, wrapAsync(applyLeave));
router.route('/my/s3url').get(wrapAsync(getSelfS3UrlForCertificate));
router.route('/my/leaves/:id').put(Validator.editSelfLeave, wrapAsync(updateSelfLeave));
router.route('/my/leaves/:id').delete(wrapAsync(deleteSelfLeave));

module.exports = router;
