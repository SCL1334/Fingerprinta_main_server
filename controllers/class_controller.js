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
  const typeName = req.body.type_name;
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
  const typeId = req.params.id;
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
  const groupName = req.body.group_name;
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
  const groupId = req.params.id;
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
    class_type_id, weekday, start_time, end_time,
  } = req.body;
  const routine = {
    class_type_id, weekday, start_time, end_time,
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
    class_type_id, weekday, start_time, end_time,
  } = req.body;
  const routineId = req.params.id;
  const routine = {
    class_type_id, weekday, start_time, end_time,
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
  const routineId = req.params.id;
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
    class_type_id, batch, class_group_id, teacher_id, start_date, end_date,
  } = req.body;
  const clas = {
    class_type_id,
    batch,
    class_group_id,
    teacher_id,
    start_date: dayjs(start_date).format('YYYY-MM-DD'),
    end_date: dayjs(end_date).format('YYYY-MM-DD'),
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
    class_type_id, batch, class_group_id, teacher_id, start_date, end_date,
  } = req.body;
  const classId = req.params.id;
  const clas = {
    class_type_id,
    batch,
    class_group_id,
    teacher_id,
    start_date,
    end_date,
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
  const classId = req.params.id;
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
