const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { createAccount } = require('../controllers/user_controller');

router.route('/user/account').post(wrapAsync(createAccount));

module.exports = router;
