const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const { MysqlError } = require('../util/custom_error');

const getMonthHolidays = async (year, month) => {
  try {
    const [calendar] = await promisePool.query(
      'SELECT * FROM calendar WHERE YEAR(date(date)) = ? AND MONTH(date(date)) = ? ORDER BY date ASC;',
      [year, month],
    );
    if (calendar.length === 0) { return new MysqlError(3000, 'no calendar data'); }
    return { data: calendar };
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

const initYearHolidays = async (calendar) => {
  try {
    await promisePool.query('INSERT INTO calendar (date, need_punch) VALUES ?', [calendar]);
    return null;
  } catch (error) {
    if (error.errno === 1062) {
      return new MysqlError(3100, error.message);
    }
    if (error.errno === 1048) {
      return new MysqlError(3101, error.message);
    }
    return new MysqlError(2100, error.message);
  }
};

const checkDateExist = async (date) => {
  try {
    const [dates] = await promisePool.query('SELECT date FROM calendar WHERE date = ?', [date]);
    if (dates.length === 0) {
      return { exist: false };
    }
    return { exist: true };
  } catch (error) {
    return new MysqlError(2200, error.message);
  }
};

const editHoliday = async (date) => {
  try {
    await promisePool.query('UPDATE calendar SET need_punch = !need_punch WHERE date = ?', [date]);
    return null;
  } catch (error) {
    return new MysqlError(2200, error.message);
  }
};

const deleteYearHolidays = async (year) => {
  try {
    await promisePool.query('DELETE FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    return null;
  } catch (error) {
    return new MysqlError(2300, error.message);
  }
};

const checkYearExist = async (year) => {
  try {
    const [years] = await promisePool.query('SELECT date FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    if (years.length === 0) {
      return { exist: false };
    }
    return { exist: true };
  } catch (error) {
    return new MysqlError(2001, error.message);
  }
};

const getPunchException = async (year = null, month = null) => {
  try {
    const filter = (year && month) ? 'WHERE YEAR(date(date)) = ? AND MONTH(date(date)) = ?' : '';
    const [punchExceptions] = await promisePool.query(
      `SELECT * FROM punch_exception ${filter} ORDER BY date ASC;`,
      [year, month],
    );
    return { data: punchExceptions };
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

const createPunchException = async (punchException) => {
  try {
    const [result] = await promisePool.query('INSERT INTO punch_exception SET ?', punchException);
    return { data: { insert_id: result.insertId } };
  } catch (error) {
    if (error.errno === 1062) {
      return new MysqlError(3100, error.message);
    }
    if (error.errno === 1048) {
      return new MysqlError(3101, error.message);
    }
    if (error.errno === 1452) {
      return new MysqlError(3102, error.message);
    }
    return new MysqlError(2100, error.message);
  }
};

const deletePunchException = async (punchExceptionId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    await promisePool.query('DELETE FROM punch_exception WHERE id = ?', [punchExceptionId]);
    return null;
  } catch (error) {
    return new MysqlError(2300, error.message);
  }
};

const checkExceptionExist = async (punchExceptionId) => {
  try {
    const [exceptions] = await promisePool.query('SELECT id FROM punch_exception WHERE id = ?', [punchExceptionId]);
    if (exceptions.length === 0) {
      return { exist: false };
    }
    return { exist: true };
  } catch (error) {
    return new MysqlError(2001, error.message);
  }
};

const getExceptionDays = async (searchFrom, searchTo) => {
  const [exceptionDays] = await promisePool.query(`
  SELECT class_type_id, batch, date, start, end FROM punch_exception 
  WHERE date >= ? AND date <= ?; 
`, [searchFrom, searchTo]);
  const formattedExceptionDays = exceptionDays.map((day) => {
    const formattedDay = JSON.parse(JSON.stringify(day));
    formattedDay.date = dayjs(formattedDay.date);
    return formattedDay;
  });
  return formattedExceptionDays;
};

const getSchoolDays = async (searchFrom, searchTo) => {
  const [schoolDays] = await promisePool.query(`
  SELECT date FROM calendar
  WHERE need_punch = 1 AND date >= ? AND date <= ?;
`, [searchFrom, searchTo]);
  const formattedSchoolDays = schoolDays.map((day) => {
    const formattedDay = JSON.parse(JSON.stringify(day));
    formattedDay.date = dayjs(formattedDay.date);
    return formattedDay;
  });
  return formattedSchoolDays;
};

module.exports = {
  getMonthHolidays,
  initYearHolidays,
  checkDateExist,
  editHoliday,
  checkYearExist,
  deleteYearHolidays,
  getPunchException,
  createPunchException,
  checkExceptionExist,
  deletePunchException,
  getExceptionDays,
  getSchoolDays,
};
