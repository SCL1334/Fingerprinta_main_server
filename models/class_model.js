const dayjs = require('dayjs');
const { promisePool } = require('./mysqlcon');

// Type Manage
const getTypes = async () => {
  try {
    const [types] = await promisePool.query('SELECT * FROM class_type');
    return types;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createType = async (typeName) => {
  try {
    await promisePool.query('INSERT INTO class_type SET ?', { name: typeName });
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062) {
      return -1;
    }
    return 0;
  }
};

const deleteType = async (typeId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_type WHERE id = ?', [typeId]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM class_type WHERE id = ?', [typeId]);
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

// Group Manage
const getGroups = async () => {
  try {
    const [groups] = await promisePool.query('SELECT * FROM class_group');
    return groups;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createGroup = async (groupName) => {
  try {
    await promisePool.query('INSERT INTO class_group SET ?', { name: groupName });
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062) {
      return -1;
    }
    return 0;
  }
};

const deleteGroup = async (groupId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_group WHERE id = ?', [groupId]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM class_type WHERE id = ?', [groupId]);
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

// Routine Manage
const getRoutines = async () => {
  try {
    const [routines] = await promisePool.query('SELECT * FROM class_routine');
    return routines;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createRoutine = async (routine) => {
  try {
    await promisePool.query('INSERT INTO class_routine SET ?', routine);
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062) {
      return -1;
    }
    return 0;
  }
};

const editRoutine = async (routineId, routine) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM class_routine WHERE id = ?', [routineId]);
    if (result.length === 0) {
      console.log('Target product not exist');
      return -1;
    }
    await promisePool.query('UPDATE class_routine SET ? WHERE id = ?', [routine, routineId]);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const deleteRoutine = async (routineId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class_routine WHERE id = ?', [routineId]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM class_routine WHERE id = ?', [routineId]);
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

// Class Manage
const getClasses = async () => {
  try {
    const [classes] = await promisePool.query('SELECT * FROM class');
    classes.map((clas) => {
      clas.start_date = dayjs(clas.start_date).format('YYYY-MM-DD');
      clas.end_date = dayjs(clas.end_date).format('YYYY-MM-DD');
    });
    return classes;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createClass = async (clas) => {
  try {
    await promisePool.query('INSERT INTO class SET ?', clas);
    return 1;
  } catch (err) {
    console.log(err);
    const { errno } = err;
    // 1062 Duplicate entry
    if (errno === 1062) {
      return -1;
    }
    return 0;
  }
};

const editClass = async (classId, clas) => {
  try {
    const [result] = await promisePool.query('SELECT id FROM class WHERE id = ?', [classId]);
    if (result.length === 0) {
      console.log('Target product not exist');
      return -1;
    }
    await promisePool.query('UPDATE class SET ? WHERE id = ?', [clas, classId]);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const deleteClass = async (classId) => {
  // delete success:1  fail case: server 0 / target not exist -1 /foreign key constraint -2
  try {
    const [result] = await promisePool.query('SELECT id FROM class WHERE id = ?', [classId]);
    if (result.length === 0) {
      console.log('target not exist');
      return -1;
    }
    await promisePool.query('DELETE FROM class WHERE id = ?', [classId]);
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
  getClasses,
  createClass,
  editClass,
  deleteClass,
};
