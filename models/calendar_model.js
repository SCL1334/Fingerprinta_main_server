const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

const getMonthHolidays = async (year, month) => {
  try {
    const [calendar] = await promisePool.query(
      'SELECT * FROM calendar WHERE YEAR(date(date)) = ? AND MONTH(date(date)) = ? ORDER BY date ASC;',
      [year, month],
    );
    calendar.forEach((date) => {
      date.date = dayjs(date.date).format('YYYY-MM-DD');
    });
    return calendar;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const initYearHolidays = async (year) => {
  try {
    const rawCalendar = require(`../public/calendar_initial/${year}_calendar.json`);
    const initCalendar = rawCalendar.reduce((acc, cur) => {
      const needPunch = cur['是否放假'] === '2' ? 0 : 1;
      acc.push([cur['西元日期'], needPunch]);
      return acc;
    }, []);
    await promisePool.query('INSERT INTO calendar (date, need_punch) VALUES ?', [initCalendar]);
    return 1010;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1062) {
      return 3010;
    }
    if (errno === 1045) {
      return 3011;
    }
    return 2010;
  }
};

const editHoliday = async (date) => {
  try {
    const [dates] = await promisePool.query('SELECT date FROM calendar WHERE date = ?', [date]);
    if (dates.length === 0) {
      return 3020;
    }
    await promisePool.query('UPDATE calendar SET need_punch = !need_punch WHERE date = ?', [date]);
    return 1020;
  } catch (err) {
    console.log(err);
    return 2020;
  }
};

const deleteYearHolidays = async (year) => {
  // delete success:1  fail case: server 0 / target not exist -1
  try {
    const [result] = await promisePool.query('SELECT date FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    if (result.length === 0) {
      console.log('target not exist');
      return 3030;
    }
    await promisePool.query('DELETE FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    return 1030;
  } catch (err) {
    console.log(err);
    return 2030;
  }
};

const getPunchException = async (year, month) => {
  try {
    const [punchExceptions] = await promisePool.query(
      'SELECT * FROM punch_exception WHERE YEAR(date(date)) = ? AND MONTH(date(date)) = ? ORDER BY date ASC;',
      [year, month],
    );
    punchExceptions.forEach((date) => {
      date.date = dayjs(date.date).format('YYYY-MM-DD');
    });
    return punchExceptions;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createPunchException = async (punchException) => {
  try {
    const [result] = await promisePool.query('INSERT INTO punch_exception SET ?', punchException);
    return { code: 1010, insert_id: result.insertId };
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const deletePunchException = async (punchExceptionId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM punch_exception WHERE id = ?', [punchExceptionId]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM punch_exception WHERE id = ?', [punchExceptionId]);
    return 1;
  } catch (error) {
    console.log(error);
    const { errno } = error;
    if (errno === 1451) {
      // conflict err
      return -2;
    }
    return 0;
  }
};

module.exports = {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays, getPunchException, createPunchException, deletePunchException,
};
