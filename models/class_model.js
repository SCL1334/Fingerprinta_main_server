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
  const conn = await promisePool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [result] = await conn.query('SELECT id FROM class_routine WHERE id = ?', [routineId]);
    if (result.length === 0) {
      console.log('Target product not exist');
      return -1;
    }
    await conn.query('UPDATE class_routine SET ? WHERE id = ?', [routine, routineId]);
    await conn.query('COMMIT');
    return 1;
  } catch (error) {
    await conn.query('ROLLBACK');
    console.log(error);
    return 0;
  } finally {
    await conn.release();
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
    await promisePool.query('DELETE FROM class_type WHERE id = ?', [routineId]);
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
};
