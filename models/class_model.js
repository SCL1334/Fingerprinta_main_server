const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');
const Logger = require('../util/logger');

// Type Manage
const getTypes = async () => {
  try {
    const [types] = await promisePool.query('SELECT * FROM class_type');
    return types;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const createType = async (typeName) => {
  try {
    const [result] = await promisePool.query('INSERT INTO class_type SET ?', { name: typeName });
    return { code: 1010, insert_id: result.insertId };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const deleteType = async (typeId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_type WHERE id = ?', [typeId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('DELETE FROM class_type WHERE id = ?', [typeId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1451) {
      // conflict error
      return -2;
    }
    return 0;
  }
};

// Group Manage
const getGroups = async () => {
  try {
    const [groups] = await promisePool.query('SELECT * FROM class_group');
    return groups;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const createGroup = async (groupName) => {
  try {
    const [result] = await promisePool.query('INSERT INTO class_group SET ?', { name: groupName });
    return { code: 1010, insert_id: result.insertId };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    // 1062 Duplicate entry, 1048 ER_BAD_NULL_ERROR
    if (errno === 1062 || errno === 1048) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const deleteGroup = async (groupId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_group WHERE id = ?', [groupId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('DELETE FROM class_group WHERE id = ?', [groupId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1451) {
      // conflict error
      return -2;
    }
    return 0;
  }
};

// Routine Manage
const getRoutines = async (classTypeId = null) => {
  try {
    const sqlFilter = (classTypeId) ? ' WHERE class_type_id = ?' : '';
    const [routines] = await promisePool.query(`
    SELECT cr.*, ct.name AS class_type_name 
    FROM class_routine AS cr
    LEFT OUTER JOIN class_type AS ct ON ct.id = cr.class_type_id
    ${sqlFilter}`, [classTypeId]);
    return routines;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const createRoutine = async (routine) => {
  try {
    const [result] = await promisePool.query('INSERT INTO class_routine SET ?', routine);
    return { code: 1010, insert_id: result.insertId };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const editRoutine = async (routineId, routine) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM class_routine WHERE id = ?', [routineId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return { code: 3020 };
    }
    await promisePool.query('UPDATE class_routine SET ? WHERE id = ?', [routine, routineId]);
    return { code: 1020 };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return { code: 3020 };
    }
    return { code: 2020 };
  }
};

const deleteRoutine = async (routineId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_routine WHERE id = ?', [routineId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('DELETE FROM class_routine WHERE id = ?', [routineId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1451) {
      // conflict error
      return -2;
    }
    return 0;
  }
};

// Teacher - Class pair
const addTeacher = async (classId, teacherId) => {
  try {
    await promisePool.query('INSERT INTO class_teacher (class_id, teacher_id) VALUES (?, ?) ', [classId, teacherId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    return 0;
  }
};

const removeTeacher = async (classId, teacherId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT * FROM class_teacher WHERE class_id = ? AND teacher_id = ?', [classId, teacherId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('DELETE FROM class_teacher WHERE class_id = ? AND teacher_id = ?', [classId, teacherId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1451) {
      // conflict error
      return -2;
    }
    return 0;
  }
};

// Class Manage
const getClasses = async (teacherId = null) => {
  try {
    const sqlFilter = (teacherId) ? ' WHERE c.id IN (SELECT class_id FROM class_teacher WHERE teacher_id = ?)' : '';
    const [classes] = await promisePool.query(`
    SELECT c.*, ct.name as class_type_name, cg.name as class_group_name FROM class as c
    LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
    LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
    ${sqlFilter}
    `, [teacherId]);
    const formattedClasses = classes.map((clas) => {
      const formattedClass = JSON.parse(JSON.stringify(clas));
      formattedClass.start_date = dayjs(clas.start_date).format('YYYY-MM-DD');
      formattedClass.end_date = dayjs(clas.end_date).format('YYYY-MM-DD');
      return formattedClass;
    });
    return formattedClasses;
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const getOneClass = async (classId) => {
  try {
    const sqlFilter = ' WHERE c.id = ?';
    const [classes] = await promisePool.query(`
    SELECT c.*, ct.name as class_type_name, cg.name as class_group_name FROM class as c
    LEFT OUTER JOIN class_group as cg ON cg.id = c.class_group_id 
    LEFT OUTER JOIN class_type as ct ON ct.id = c.class_type_id
    ${sqlFilter}
    `, [classId]);
    const formattedClasses = classes.map((clas) => {
      const formattedClass = JSON.parse(JSON.stringify(clas));
      formattedClass.start_date = dayjs(clas.start_date).format('YYYY-MM-DD');
      formattedClass.end_date = dayjs(clas.end_date).format('YYYY-MM-DD');
      return formattedClass;
    });
    return formattedClasses[0];
  } catch (error) {
    new Logger(error).error();
    return null;
  }
};

const createClass = async (clas) => {
  try {
    const [result] = await promisePool.query('INSERT INTO class SET ?', clas);
    return { code: 1010, insert_id: result.insertId };
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    // 1062 Duplicate entry
    if (errno === 1062 || errno === 1048) {
      return { code: 3010 };
    }
    return { code: 2010 };
  }
};

const editClass = async (classId, clas) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM class WHERE id = ?', [classId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('UPDATE class SET ? WHERE id = ?', [clas, classId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    return 0;
  }
};

const deleteClass = async (classId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class WHERE id = ?', [classId]);
    if (result.length === 0) {
      new Logger('target not exist').error();
      return -1;
    }
    await promisePool.query('DELETE FROM class WHERE id = ?', [classId]);
    return 1;
  } catch (error) {
    new Logger(error).error();
    const { errno } = error;
    if (errno === 1451) {
      // conflict error
      return -2;
    }
    return 0;
  }
};

module.exports = {
  getTypes,
  createType,
  deleteType,
  getGroups,
  createGroup,
  deleteGroup,
  getRoutines,
  editRoutine,
  createRoutine,
  deleteRoutine,
  addTeacher,
  removeTeacher,
  getClasses,
  getOneClass,
  createClass,
  editClass,
  deleteClass,
};
