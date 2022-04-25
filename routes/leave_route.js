const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getTypes, createType, deleteType, getAllLeaves, approveLeave, updateLeave, deleteLeave,
} = require('../controllers/leave_controller');

router.route('/leaves/types').get(wrapAsync(getTypes));
router.route('/leaves/types').post(wrapAsync(createType));
router.route('/leaves/types/:id').delete(wrapAsync(deleteType));
router.route('/leaves/:id').patch(wrapAsync(approveLeave));
router.route('/leaves/:id').put(wrapAsync(updateLeave));
router.route('/leaves/:id').delete(wrapAsync(deleteLeave));

module.exports = router;
