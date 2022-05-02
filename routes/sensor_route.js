const router = require('express').Router();

const { wrapAsync } = require('../util/util');

const { stopSensor, turnOnIdentify } = require('../controllers/sensor_controller');

router.route('/sensor/identify').post(wrapAsync(turnOnIdentify));
router.route('/sensor/stop').post(wrapAsync(stopSensor));

module.exports = router;
