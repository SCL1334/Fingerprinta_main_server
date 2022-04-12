const dayjs = require('dayjs');
const Class = require('../models/class_model');

// Type Manage
const getTypes = async (req, res) => {
  const types = await Class.getTypes();
  if (types) {
    res.status(200).json({ data: types });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createType = async (req, res) => {
  const { typeName } = req.body;
  const result = await Class.createType(typeName);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Create failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const deleteType = async (req, res) => {
  const { typeId } = req.body;
  const result = await Class.deleteType(typeId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else if (result === -2) {
    res.status(409).json({ error: 'Conflict' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

// Group Manage
const getGroups = async (req, res) => {
  const types = await Class.getGroups();
  if (types) {
    res.status(200).json({ data: types });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createGroup = async (req, res) => {
  const { groupName } = req.body;
  const result = await Class.createGroup(groupName);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Create failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const deleteGroup = async (req, res) => {
  const { groupId } = req.body;
  const result = await Class.deleteGroup(groupId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else if (result === -2) {
    res.status(409).json({ error: 'Conflict' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

// Routine Manage
const getRoutines = async (req, res) => {
  const routines = await Class.getRoutines();
  if (routines) {
    res.status(200).json({ data: routines });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createRoutine = async (req, res) => {
  const {
    classTypeId, weekday, startTime, endTime,
  } = req.body;
  const routine = {
    class_type_id: classTypeId, weekday, start_time: startTime, end_time: endTime,
  };

  const result = await Class.createRoutine(routine);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Create failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const editRoutine = async (req, res) => {
  const {
    routineId, classTypeId, weekday, startTime, endTime,
  } = req.body;
  const routine = {
    class_type_id: classTypeId, weekday, start_time: startTime, end_time: endTime,
  };
  // remove blank value
  Object.keys(routine).forEach((key) => {
    if (routine[key] === undefined) {
      delete routine[key];
    }
  });

  const result = await Class.editRoutine(routineId, routine);
  if (result === 0) {
    res.status(500).json({ error: 'Update failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Update failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Update OK' });
  }
};

const deleteRoutine = async (req, res) => {
  const { routineId } = req.body;
  const result = await Class.deleteRoutine(routineId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else if (result === -2) {
    res.status(409).json({ error: 'Conflict' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

// Class Manage
const getClasses = async (req, res) => {
  const classes = await Class.getClasses();
  if (classes) {
    res.status(200).json({ data: classes });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createClass = async (req, res) => {
  const {
    classTypeId, batch, classGroupId, teacherId, startDate, endDate,
  } = req.body;
  const clas = {
    class_type_id: classTypeId,
    batch,
    class_group_id: classGroupId,
    teacher_id: teacherId,
    start_date: dayjs(startDate).format('YYYY-MM-DD'),
    end_date: dayjs(endDate).format('YYYY-MM-DD'),
  };

  const result = await Class.createClass(clas);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Create failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const editClass = async (req, res) => {
  const {
    classId, classTypeId, batch, classGroupId, teacherId, startDate, endDate,
  } = req.body;
  const clas = {
    id: classId,
    class_type_id: classTypeId,
    batch,
    class_group_id: classGroupId,
    teacher_id: teacherId,
    start_date: startDate,
    end_date: endDate,
  };

  // remove blank value
  Object.keys(clas).forEach((key) => {
    if (clas[key] === undefined) {
      delete clas[key];
    }
  });

  const result = await Class.editClass(classId, clas);
  if (result === 0) {
    res.status(500).json({ error: 'Update failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Update failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Update OK' });
  }
};

const deleteClass = async (req, res) => {
  const { classId } = req.body;
  const result = await Class.deleteClass(classId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else if (result === -2) {
    res.status(409).json({ error: 'Conflict' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
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
  createRoutine,
  editRoutine,
  deleteRoutine,
  getClasses,
  createClass,
  editClass,
  deleteClass,
};
