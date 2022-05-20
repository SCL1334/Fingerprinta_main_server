const CalendarService = require('../service/calendar_service');
const ResponseTransformer = require('../util/response');

const getMonthHolidays = async (req, res) => {
  const { monthWithYear } = req.params;
  const result = await CalendarService.getMonthHolidays(monthWithYear);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const initYearHolidays = async (req, res) => {
  const { calendar } = req.body;
  const result = await CalendarService.initYearHolidays(calendar);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const editHoliday = async (req, res) => {
  const { date } = req.params;
  const result = await CalendarService.editHoliday(date);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const deleteYearHolidays = async (req, res) => {
  const { year } = req.params;
  const result = await CalendarService.deleteYearHolidays(year);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const getPunchException = async (req, res) => {
  const { monthWithYear } = req.params;
  const result = await CalendarService.getPunchException(monthWithYear);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const createPunchException = async (req, res) => {
  const { punchException } = res.locals;
  const result = await CalendarService.createPunchException(punchException);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const deletePunchException = async (req, res) => {
  const punchExceptionId = req.params.id;
  const result = await CalendarService.deletePunchException(punchExceptionId);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
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
