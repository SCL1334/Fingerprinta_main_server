const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

const getMonthHolidays = async (year, month) => {
  try {
    const [calendar] = await promisePool.query(
      'SELECT * FROM calendar WHERE YEAR(date(date)) = ? AND MONTH(date(date)) = ? ORDER BY date ASC;',
      [year, month],
    );
    calendar.map((date) => {
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
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno === 1062) {
      return -1;
    }
    return 0;
  }
};

const editHoliday = async (date) => {
  try {
    await promisePool.query('UPDATE calendar SET need_punch = !need_punch WHERE date = ?', [date]);
    return 1;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

const deleteYearHolidays = async (year) => {
  // delete success:1  fail case: server 0 / target not exist -1
  try {
    const [result] = await promisePool.query('SELECT date FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM calendar WHERE YEAR(date(date)) = ?', [year]);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

module.exports = {
  getMonthHolidays, initYearHolidays, editHoliday, deleteYearHolidays,
};
