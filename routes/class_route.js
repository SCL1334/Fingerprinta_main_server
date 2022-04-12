const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const { getTypes, createType, deleteType } = require('../controllers/class_controller');

router.route('/class/type').get(wrapAsync(getTypes));
router.route('/class/type').post(wrapAsync(createType));
router.route('/class/type').delete(wrapAsync(deleteType));

module.exports = router;
