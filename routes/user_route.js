const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  createAccount, getAccounts, deleteAccount, signIn, matchFingerprint,
} = require('../controllers/user_controller');

router.route('/user/signin').post(wrapAsync(signIn));
router.route('/user/fingerprint').post(wrapAsync(matchFingerprint));
router.route('/user/account').post(wrapAsync(createAccount));
router.route('/user/account').get(wrapAsync(getAccounts));
router.route('/user/account').delete(wrapAsync(deleteAccount));

module.exports = router;
