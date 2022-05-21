const dayjs = require('dayjs');
const xlsx = require('xlsx');
const { s3 } = require('../util/util');
const { promisePool } = require('./mysqlcon');
const { MysqlError } = require('../util/custom_error');

const getTypes = async () => {
  try {
    const [leaveTypes] = await promisePool.query(
      'SELECT * FROM leave_type',
    );
    return { data: leaveTypes };
  } catch (error) {
    return new MysqlError(2000, error.message);
  }
};

const createType = async (leaveType) => {
  try {
    const [result] = await promisePool.query('INSERT INTO leave_type SET ?', leaveType);
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

const checkTypeExist = async (typeId) => {
  try {
    const [types] = await promisePool.query('SELECT id FROM leave_type WHERE id = ?', [typeId]);
    if (types.length === 0) {
      return { exist: false };
    }
    return { exist: true };
  } catch (error) {
    return new MysqlError(2001, error.message);
  }
};

const deleteType = async (typeId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    await promisePool.query('DELETE FROM leave_type WHERE id = ?', [typeId]);
    return null;
  } catch (error) {
    if (error.errno === 1451) {
      // conflict err
      return new MysqlError(3302, error.message);
    }
    return new MysqlError(2001, error.message);
  }
};

const getAllLeaves = async (from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'WHERE date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY date DESC, student_id ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.id, sl.student_id, sl.leave_type_id, sl.date, sl.start, sl.end, sl.hours, sl.approval, sl.reason, sl.note, sl.certificate_url, s.name AS student_name,
        c.batch, cg.name AS class_group_name, ct.name AS class_type_name, lt.name AS leave_type_name, lt.need_calculate
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        LEFT OUTER JOIN leave_type as lt ON lt.id = sl.leave_type_id
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
        SELECT sl.id, sl.student_id, sl.leave_type_id, sl.date, sl.start, sl.end, sl.hours, sl.approval, sl.reason, sl.note, sl.certificate_url, s.name AS student_name, 
        c.batch, cg.name AS class_group_name, ct.name AS class_type_name, lt.name AS leave_type_name, lt.need_calculate
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        LEFT OUTER JOIN leave_type as lt ON lt.id = sl.leave_type_id
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

const checkStudentValidLeaves = async (studentId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY date DESC, student_id ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.id, sl.student_id, sl.leave_type_id, sl.reason, sl.date, sl.start, sl.end, sl.hours, sl.note, s.name AS student_name, 
        c.batch, cg.name AS class_group_name, ct.name AS class_type_name, lt.name AS leave_type_name
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        LEFT OUTER JOIN leave_type as lt ON lt.id = sl.leave_type_id
        WHERE sl.student_id = ?
        AND approval = 1
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
        SELECT sl.id, sl.student_id, sl.leave_type_id, sl.date, sl.start, sl.end, sl.hours, sl.approval, sl.reason, sl.note, sl.certificate_url, s.name AS student_name, 
        c.batch, cg.name AS class_group_name, ct.name AS class_type_name, lt.name AS leave_type_name, lt.need_calculate
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        LEFT OUTER JOIN leave_type as lt ON lt.id = sl.leave_type_id
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

const checkClassValidLeaves = async (classId, from = null, to = null) => {
  try {
    const sqlFilter = (from !== null || to !== null) ? 'AND date >= ? AND date <= ?' : '';
    const sqlSort = ' ORDER BY  student_id ASC, date ASC, start ASC';
    const [leaves] = await promisePool.query(
      `
        SELECT sl.id, sl.student_id, sl.leave_type_id, sl.reason, sl.date, sl.start, sl.end, sl.hours, sl.note, s.name AS student_name, 
        c.batch, cg.name AS class_group_name, ct.name AS class_type_name, lt.name AS leave_type_name
        FROM student_leave AS sl
        LEFT OUTER JOIN student AS s ON s.id = sl.student_id
        LEFT OUTER JOIN class AS c ON c.id = s.class_id
        LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
        LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
        LEFT OUTER JOIN leave_type as lt ON lt.id = sl.leave_type_id
        WHERE sl.student_id IN (SELECT id FROM student WHERE class_id = ?)
        AND approval = 1
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

const backupClassLeaves = async (className, leaves) => {
  const arrayWorkSheet = xlsx.utils.aoa_to_sheet(leaves);
  const backup = `請假紀錄:${className}`;
  const sheets = {};
  sheets[backup] = arrayWorkSheet;
  const workBook = {
    SheetNames: [backup],
    Sheets: sheets,
  };
  const sheetDataBuffer = xlsx.write(workBook, { bookType: 'xlsx', type: 'buffer', bookSST: false });
  try {
    const uploadResult = await s3.upload({
      Key: `test/backup/${backup}.xlsx`,
      Bucket: 'fingerprinta',
      Body: sheetDataBuffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ContentEncoding: 'base64',
    }).promise();
    console.log('upload successed');
    console.log(uploadResult);
    return { code: 1010, message: 'upload successed', location: uploadResult.Location };
  } catch (err) {
    console.log('upload failed');
    console.log(err);
    return { code: 2010, message: 'upload failed' };
  }
};

const countLeavesHours = async (studentId) => {
  try {
    const [hours] = await promisePool.query('SELECT hours FROM student_leave WHERE student_id = ? AND approval = 1', [studentId]);
    const totalHours = hours.reduce((acc, cur) => {
      acc += cur.hours;
      return acc;
    }, 0);
    return { leaves_hours: totalHours };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const countAllLeavesHours = async () => {
  try {
    const [leaves] = await promisePool.query('SELECT student_id, hours FROM student_leave WHERE approval = 1');
    const eachTotalHours = leaves.reduce((acc, cur) => {
      if (!acc[cur.student_id]) {
        acc[cur.student_id] = {};
        acc[cur.student_id].leaves_hours = cur.hours;
      } else {
        acc[cur.student_id].leaves_hours += cur.hours;
      }
      return acc;
    }, {});
    return eachTotalHours;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const applyLeave = async (leave) => {
  try {
    const [result] = await promisePool.query('INSERT INTO student_leave SET ?', leave);
    return { code: 1010, insert_id: result.insertId };
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

const updateSelfLeave = async (studentId, leaveId, leave) => {
  try {
    const [check] = await promisePool.query('SELECT id FROM student_leave WHERE id = ? AND student_id = ? AND approval = 0', [leaveId, studentId]);
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

const deleteSelfLeave = async (studentId, leaveId) => {
  try {
    const [check] = await promisePool.query('SELECT id FROM student_leave WHERE id = ? AND student_id = ? AND approval = 0', [leaveId, studentId]);
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
  checkTypeExist,
  deleteType,
  getAllLeaves,
  getClassLeaves,
  checkClassValidLeaves,
  backupClassLeaves,
  getPersonLeaves,
  checkStudentValidLeaves,
  countLeavesHours,
  countAllLeavesHours,
  applyLeave,
  updateLeave,
  updateSelfLeave,
  deleteLeave,
  deleteSelfLeave,
};
