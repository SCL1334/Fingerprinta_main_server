const dayjs = require('dayjs');
const Calendar = require('../models/calendar_model');

const getMonthHolidays = async (req, res) => {
  const targetMonth = dayjs(req.params.monthWithYear);
  const year = targetMonth.year();
  const month = targetMonth.month() + 1;
  const calendar = await Calendar.getMonthHolidays(year, month);
  if (calendar) {
    res.status(200).json({ data: calendar });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const initYearHolidays = async (req, res) => {
  const { year } = req.params;
  const result = await Calendar.initYearHolidays(year);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Create failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const editHoliday = async (req, res) => {
  const { date } = req.params;
  const result = Calendar.editHoliday(date);
  if (result === 0) {
    res.status(500).json({ error: 'Update failed' });
  } else {
    res.status(200).json({ data: 'Update OK' });
  }
};

const deleteYearHolidays = async (req, res) => {
  const { year } = req.params;
  const result = await Calendar.deleteYearHolidays(year);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

module.exports = {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays,
};
