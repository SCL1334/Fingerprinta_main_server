const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { setPunch, getPunch } = require('../controllers/attendance_controller');

router.route('/attendance/punch').post(wrapAsync(setPunch));
router.route('/attendance/punch').get(wrapAsync(getPunch));

module.exports = router;
