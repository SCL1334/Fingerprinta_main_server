const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { getFingerQuota } = require('../controllers/fingerprint_controller');

router.route('/fingerprints').get(wrapAsync(getFingerQuota));

module.exports = router;
