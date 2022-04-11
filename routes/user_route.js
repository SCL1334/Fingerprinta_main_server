const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { createAccount, signIn, matchFingerprint } = require('../controllers/user_controller');

router.route('/user/signin').post(wrapAsync(signIn));
router.route('/user/fingerprint').post(wrapAsync(matchFingerprint));
router.route('/user/account').post(wrapAsync(createAccount));

module.exports = router;
