const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getTypes, createType, deleteType,
  getGroups, createGroup, deleteGroup,
  getRoutines, createRoutine, editRoutine, deleteRoutine,
  addTeacher, removeTeacher,
  getClasses, createClass, editClass, deleteClass,
  initClassFingerList,
} = require('../controllers/class_controller');

const { getStudents, createClassStudents, getClassTeachers } = require('../controllers/user_controller');

const { getClassPunch, getClassAttendances } = require('../controllers/attendance_controller');

const { getClassLeaves, backupClassLeaves } = require('../controllers/leave_controller');

router.route('/classes/types').get(wrapAsync(getTypes));
router.route('/classes/types').post(wrapAsync(createType));
router.route('/classes/types/:id').delete(wrapAsync(deleteType));
router.route('/classes/groups').get(wrapAsync(getGroups));
router.route('/classes/groups').post(wrapAsync(createGroup));
router.route('/classes/groups/:id').delete(wrapAsync(deleteGroup));
router.route('/classes/routines').get(wrapAsync(getRoutines));
router.route('/classes/types/:id/routines').get(wrapAsync(getRoutines));
router.route('/classes/routines').post(wrapAsync(createRoutine));
router.route('/classes/routines/:id').put(wrapAsync(editRoutine));
router.route('/classes/routines/:id').delete(wrapAsync(deleteRoutine));

router.route('/classes/:id/leaves').get(wrapAsync(getClassLeaves));
router.route('/classes/:id/backup/leaves').get(wrapAsync(backupClassLeaves));

router.route('/classes/:id/attendances').get(wrapAsync(getClassAttendances));
router.route('/classes/:id/students').get(wrapAsync(getStudents));
router.route('/classes/:id/students').post(wrapAsync(createClassStudents));
router.route('/classes/:id/teachers').get(wrapAsync(getClassTeachers));
router.route('/classes/:classId/teachers/:teacherId').post(wrapAsync(addTeacher));
router.route('/classes/:classId/teachers/:teacherId').delete(wrapAsync(removeTeacher));
router.route('/classes').get(wrapAsync(getClasses));
router.route('/classes').post(wrapAsync(createClass));
router.route('/classes/:id').put(wrapAsync(editClass));
router.route('/classes/:id').delete(wrapAsync(deleteClass));

router.route('/classes/:id/fingerprint').delete(wrapAsync(initClassFingerList));

module.exports = router;
