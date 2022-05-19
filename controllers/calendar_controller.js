const CalendarService = require('../service/calendar_service');
const ResTransformer = require('../util/response');

const getMonthHolidays = async (req, res) => {
  const { monthWithYear } = req.params;
  const result = await CalendarService.getMonthHolidays(monthWithYear);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const initYearHolidays = async (req, res) => {
  const { calendar } = req.body;
  const result = await CalendarService.initYearHolidays(calendar);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const editHoliday = async (req, res) => {
  const { date } = req.params;
  const result = await CalendarService.editHoliday(date);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const deleteYearHolidays = async (req, res) => {
  const { year } = req.params;
  const result = await CalendarService.deleteYearHolidays(year);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const getPunchException = async (req, res) => {
  const { monthWithYear } = req.params;
  const result = await CalendarService.getPunchException(monthWithYear);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const createPunchException = async (req, res) => {
  const { punchException } = res.locals;
  const result = await CalendarService.createPunchException(punchException);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
};

const deletePunchException = async (req, res) => {
  const punchExceptionId = req.params.id;
  const result = await CalendarService.deletePunchException(punchExceptionId);
  const { response, httpCode } = new ResTransformer(result);
  res.status(httpCode).json({ code: response.code, error: response.error, data: response.data });
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
