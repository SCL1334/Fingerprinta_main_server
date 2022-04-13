const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getTypes, createType, deleteType,
  getGroups, createGroup, deleteGroup,
  getRoutines, createRoutine, editRoutine, deleteRoutine,
  getClasses, createClass, editClass, deleteClass,
} = require('../controllers/class_controller');

router.route('/classes/types').get(wrapAsync(getTypes));
router.route('/classes/types').post(wrapAsync(createType));
router.route('/classes/types/:id').delete(wrapAsync(deleteType));
router.route('/classes/groups').get(wrapAsync(getGroups));
router.route('/classes/groups').post(wrapAsync(createGroup));
router.route('/classes/groups/:id').delete(wrapAsync(deleteGroup));
router.route('/classes/routines').get(wrapAsync(getRoutines));
router.route('/classes/routines').post(wrapAsync(createRoutine));
router.route('/classes/routines/:id').put(wrapAsync(editRoutine));
router.route('/classes/routines/:id').delete(wrapAsync(deleteRoutine));
router.route('/classes').get(wrapAsync(getClasses));
router.route('/classes').post(wrapAsync(createClass));
router.route('/classes/:id').put(wrapAsync(editClass));
router.route('/classes/:id').delete(wrapAsync(deleteClass));

module.exports = router;
