const router = require('express').Router();

const { wrapAsync } = require('../util/util');
const {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays,
} = require('../controllers/calendar_controller');

router.route('/calendar/months/:monthWithYear').get(wrapAsync(getMonthHolidays));
router.route('/calendar/years/:year').post(wrapAsync(initYearHolidays));
router.route('/calendar/date/:date').put(wrapAsync(editHoliday));
router.route('/calendar/years/:year').delete(wrapAsync(deleteYearHolidays));

module.exports = router;
