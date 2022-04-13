const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { setPunch, getPunch } = require('../controllers/attendance_controller');

// this is for sensor post only
router.route('/attendances/punches').post(wrapAsync(setPunch));
// for user check
router.route('/attendances/punches').get(wrapAsync(getPunch));

module.exports = router;
