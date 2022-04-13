const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  createAccount, getAccounts, deleteAccount, signIn, matchFingerprint,
} = require('../controllers/user_controller');

router.route('/users/signin').post(wrapAsync(signIn));
router.route('/users/fingerprints').post(wrapAsync(matchFingerprint));
router.route('/users/accounts').post(wrapAsync(createAccount));
router.route('/users/accounts').get(wrapAsync(getAccounts));
router.route('/users/accounts/:id').delete(wrapAsync(deleteAccount));

module.exports = router;
