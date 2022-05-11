const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');
const {
  getTypes, createType, deleteType, getAllLeaves, auditLeave, updateLeave, deleteLeave,
} = require('../controllers/leave_controller');

router.route('/leaves/types').get(wrapAsync(getTypes));
router.route('/leaves/types').post(Validator.createLeaveType, wrapAsync(createType));
router.route('/leaves/types/:id').delete(wrapAsync(deleteType));
router.route('/leaves/:id').patch(wrapAsync(auditLeave));
router.route('/leaves/:id').put(Validator.editStudentLeave, wrapAsync(updateLeave));
router.route('/leaves/:id').delete(wrapAsync(deleteLeave));

module.exports = router;
