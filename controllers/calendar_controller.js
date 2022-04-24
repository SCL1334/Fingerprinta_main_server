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

const getPunchException = async (req, res) => {
  const targetMonth = dayjs(req.params.monthWithYear);
  const year = targetMonth.year();
  const month = targetMonth.month() + 1;
  const punchException = await Calendar.getPunchException(year, month);
  if (punchException) {
    res.status(200).json({ data: punchException });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createPunchException = async (req, res) => {
  const {
    class_type_id, batch, date, start_time, end_time,
  } = req.body;
  const punchException = {
    class_type_id,
    batch,
    date: dayjs(date).format('YYYY-MM-DD'),
    start: start_time,
    end: end_time,
  };

  const result = await Calendar.createPunchException(punchException);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const deletePunchException = async (req, res) => {
  const punchExceptionId = req.params.id;
  const result = await Calendar.deletePunchException(punchExceptionId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

module.exports = {
  getMonthHolidays,
  initYearHolidays,
  editHoliday,
  deleteYearHolidays,
  getPunchException,
  createPunchException,
  deletePunchException,
};
