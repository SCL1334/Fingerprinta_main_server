const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { setPunch } = require('../controllers/attendance_controller');

router.route('/attendance/punch').post(wrapAsync(setPunch));

module.exports = router;
