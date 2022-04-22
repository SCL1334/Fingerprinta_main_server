const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

const getTypes = async () => {
  try {
    const [leaveTypes] = await promisePool.query(
      'SELECT * FROM leave_type',
    );
    return leaveTypes;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createType = async (typeName) => {
  try {
    await promisePool.query('INSERT INTO leave_type SET ?', { name: typeName });
    return 1010;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return 3010;
    }
    return 2010;
  }
};

const deleteType = async (typeId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM leave_type WHERE id = ?', [typeId]);
    if (result.length === 0) {
      console.log('target not exist');
      return 3050;
    }
    await promisePool.query('DELETE FROM leave_type WHERE id = ?', [typeId]);
    return 1030;
  } catch (error) {
    console.log(error);
    const { errno } = error;
    if (errno === 1451) {
      // conflict err
      return 3030;
    }
    return 2030;
  }
};

const getAllLeaves = async (from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'WHERE date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY date DESC, student_id ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.*, s.name AS student_name, c.batch, cg.name AS class_group_name, ct.name AS class_type_name
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        ${sqlFilter}
        ${sqlSort}
      `,
      [from, to],
    );
    leaves.forEach((leave) => {
      leave.date = dayjs(leave.date).format('YYYY-MM-DD');
    });
    return leaves;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getPersonLeaves = async (studentId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY date DESC, student_id ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.*, s.name AS student_name, c.batch, cg.name AS class_group_name, ct.name AS class_type_name
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        WHERE sl.student_id = ?
        ${sqlFilter}
        ${sqlSort}
      `,
      [studentId, from, to],
    );
    leaves.forEach((leave) => {
      leave.date = dayjs(leave.date).format('YYYY-MM-DD');
    });
    return leaves;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getClassLeaves = async (classId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY date DESC, student_id ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.*, s.name AS student_name, c.batch, cg.name AS class_group_name, ct.name AS class_type_name
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        WHERE sl.student_id IN (SELECT id FROM student WHERE class_id = ?)
        ${sqlFilter}
        ${sqlSort}
      `,
      [classId, from, to],
    );
    leaves.forEach((leave) => {
      leave.date = dayjs(leave.date).format('YYYY-MM-DD');
    });
    return leaves;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const applyLeave = async (leave) => {
  try {
    await promisePool.query('INSERT INTO student_leave SET ?', leave);
    return 1010;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    if (errno) {
      return 3010;
    }
    return 2010;
  }
};

const updateLeave = async (leaveId, leave) => {
  try {
    const [check] = await promisePool.query('SELECT id FROM student_leave WHERE id = ?', [leaveId]);
    if (check.length === 0) {
      return 3050;
    }
    await promisePool.query('UPDATE student_leave SET ? WHERE id = ?', [leave, leaveId]);
    return 1020;
  } catch (err) {
    console.log(err);
    return 2020;
  }
};

const deleteLeave = async (leaveId) => {
  try {
    const [check] = await promisePool.query('SELECT id FROM student_leave WHERE id = ?', [leaveId]);
    if (check.length === 0) {
      return 3050;
    }
    await promisePool.query('DELETE FROM student_leave WHERE id = ?', [leaveId]);
    return 1030;
  } catch (err) {
    console.log(err);
    return 2030;
  }
};

module.exports = {
  getTypes,
  createType,
  deleteType,
  getAllLeaves,
  getClassLeaves,
  getPersonLeaves,
  applyLeave,
  updateLeave,
  deleteLeave,
};
