const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const Validator = require('../util/validator');
const {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays,
  getPunchException, createPunchException, deletePunchException,
} = require('../controllers/calendar_controller');

router.route('/calendar/months/:monthWithYear').get(wrapAsync(getMonthHolidays));
router.route('/calendar').post(wrapAsync(initYearHolidays));
router.route('/calendar/date/:date').put(wrapAsync(editHoliday));
router.route('/calendar/years/:year').delete(wrapAsync(deleteYearHolidays));
router.route('/calendar/months/:monthWithYear/punchExceptions').get(wrapAsync(getPunchException));
router.route('/calendar/punchExceptions').post(Validator.createPunchException, wrapAsync(createPunchException));
router.route('/calendar/punchExceptions/:id').delete(wrapAsync(deletePunchException));

module.exports = router;
