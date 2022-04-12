const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getTypes, createType, deleteType,
  getGroups, createGroup, deleteGroup,
  getRoutines, createRoutine, editRoutine, deleteRoutine,
} = require('../controllers/class_controller');

router.route('/class/type').get(wrapAsync(getTypes));
router.route('/class/type').post(wrapAsync(createType));
router.route('/class/type').delete(wrapAsync(deleteType));
router.route('/class/group').get(wrapAsync(getGroups));
router.route('/class/group').post(wrapAsync(createGroup));
router.route('/class/group').delete(wrapAsync(deleteGroup));
router.route('/class/routine').get(wrapAsync(getRoutines));
router.route('/class/routine').post(wrapAsync(createRoutine));
router.route('/class/routine').put(wrapAsync(editRoutine));
router.route('/class/routine').delete(wrapAsync(deleteRoutine));

module.exports = router;
