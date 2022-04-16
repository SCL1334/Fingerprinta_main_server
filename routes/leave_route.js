const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getTypes, createType, deleteType, getAllLeaves, approveLeave, deleteLeave,
} = require('../controllers/leave_controller');

router.route('/leaves/types').get(wrapAsync(getTypes));
router.route('/leaves/types').post(wrapAsync(createType));
router.route('/leaves/types/:id').delete(wrapAsync(deleteType));
router.route('/leaves').get(wrapAsync(getAllLeaves));
router.route('/leaves/:id').put(wrapAsync(approveLeave));
router.route('/leaves/:id').delete(wrapAsync(deleteLeave));

module.exports = router;
