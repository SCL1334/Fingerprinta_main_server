const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  createAccount, getAccounts, deleteAccount, signIn, matchFingerprint,
} = require('../controllers/user_controller');

router.route('/users/signin').post(wrapAsync(signIn));
router.route('/users/fingerprints').post(wrapAsync(matchFingerprint));
router.route('/users/account').post(wrapAsync(createAccount));
router.route('/users/account').get(wrapAsync(getAccounts));
router.route('/users/account/:id').delete(wrapAsync(deleteAccount));

module.exports = router;
