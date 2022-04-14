const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays,
} = require('../controllers/calendar_controller');

router.route('/calendar/holidays/months/:monthWithYear').get(wrapAsync(getMonthHolidays));
router.route('/calendar/holidays/years/:year').post(wrapAsync(initYearHolidays));
router.route('/calendar/holidays/date/:date').put(wrapAsync(editHoliday));
router.route('/calendar/holidays/years/:year').delete(wrapAsync(deleteYearHolidays));

module.exports = router;
