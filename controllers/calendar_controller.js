const dayjs = require('dayjs');
const Calendar = require('../models/calendar_model');

const getMonthHolidays = async (req, res) => {
  const targetMonth = dayjs(req.params.monthWithYear);
  const year = targetMonth.year();
  const month = targetMonth.month() + 1;
  const calendar = await Calendar.getMonthHolidays(year, month);
  if (calendar) {
    res.status(200).json({ code: 1000, data: calendar });
  } else {
    res.status(500).json({ code: 2000, error: { message: 'Read failed Due to server error' } });
  }
};

const initYearHolidays = async (req, res) => {
  const { calendar } = req.body;
  const status = await Calendar.initYearHolidays(calendar);
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Create successfully' } });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Create failed due to invalid input' } });
  }
};

const editHoliday = async (req, res) => {
  let { date } = req.params;
  date = dayjs(date);
  let status = 3021;
  if (date.isValid()) {
    status = await Calendar.editHoliday(date.format('YYYY-MM-DD'));
  }
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Update successfully' } });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Update failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Update failed due to invalid input' } });
  }
};

const deleteYearHolidays = async (req, res) => {
  const { year } = req.params;
  const status = await Calendar.deleteYearHolidays(year);
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Delete successfully' } });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Delete failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Delete failed due to invalid input' } });
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
  const { punchException } = res.locals;
  punchException.date = dayjs(punchException.date).format('YYYY-MM-DD');

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
