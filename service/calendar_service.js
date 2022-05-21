const dayjs = require('dayjs');
const Calendar = require('../models/calendar_model');
const { GeneralError } = require('../util/custom_error');

const getMonthHolidays = async (monthWithYear) => {
  const targetMonth = dayjs(monthWithYear);
  if (!targetMonth.isValid()) { return new GeneralError(3003, 'input date is invalid'); }
  const year = targetMonth.year();
  const month = targetMonth.month() + 1;
  const calendar = await Calendar.getMonthHolidays(year, month);
  if (calendar.errCode) { return calendar; }
  // date formatting
  calendar.data.forEach((date) => {
    date.date = dayjs(date.date).format('YYYY-MM-DD');
  });
  return { code: 1000, data: calendar.data };
};

const initYearHolidays = async (calendar) => {
  const initCalendar = calendar.reduce((acc, cur) => {
    const needPunch = cur['是否放假'] === '2' ? 0 : 1;
    acc.push([cur['西元日期'], needPunch]);
    return acc;
  }, []);

  const result = await Calendar.initYearHolidays(initCalendar);
  if (result === null) { return { code: 1100 }; }
  return result;
};

const editHoliday = async (date) => {
  const editDate = dayjs(date);
  if (!editDate.isValid()) { return new GeneralError(3203, 'input date is invalid'); }
  const preCheck = await Calendar.checkDateExist(editDate.format('YYYY-MM-DD'));
  if (preCheck instanceof Error) {
    return preCheck;
  }
  if (!preCheck.exist) { return new GeneralError(3001, 'no target date data'); }
  const result = await Calendar.editHoliday(editDate.format('YYYY-MM-DD'));
  if (result === null) { return { code: 1200 }; }
  return result;
};

const deleteYearHolidays = async (year) => {
  const preCheck = await Calendar.checkYearExist(year);
  if (preCheck instanceof Error) { return preCheck; }
  if (!preCheck.exist) { return new GeneralError(3001, 'no target year data'); }
  const result = await Calendar.deleteYearHolidays(year);
  if (result === null) { return { code: 1300 }; }
  return result;
};

const getPunchException = async (monthWithYear) => {
  const targetMonth = dayjs(monthWithYear);
  if (!targetMonth.isValid()) { return new GeneralError(3003, 'input date is invalid'); }
  const year = targetMonth.year();
  const month = targetMonth.month() + 1;
  const punchExceptions = await Calendar.getPunchException(year, month);
  if (punchExceptions instanceof Error) { return punchExceptions; }
  // no exception is normal
  if (punchExceptions.data.length === 0) { return { code: 1001 }; }
  punchExceptions.data.forEach((date) => {
    date.date = dayjs(date.date).format('YYYY-MM-DD');
  });
  return { code: 1000, data: punchExceptions.data };
};

const createPunchException = async (punchException) => {
  punchException.date = dayjs(punchException.date).format('YYYY-MM-DD');
  const result = await Calendar.createPunchException(punchException);
  if (result.data) { return { code: 1100, data: { insert_id: result.data.insert_id } }; }
  return result;
};

const deletePunchException = async (punchExceptionId) => {
  const preCheck = await Calendar.checkExceptionExist(punchExceptionId);
  if (preCheck instanceof Error) { return preCheck; }
  if (!preCheck.exist) { return new GeneralError(3001, 'no target year data'); }
  const result = await Calendar.deletePunchException(punchExceptionId);
  if (result === null) { return { code: 1300 }; }
  return result;
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
