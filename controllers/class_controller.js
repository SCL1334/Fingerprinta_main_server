const dayjs = require('dayjs');
const Class = require('../models/class_model');
const Fingerprint = require('../models/fingerprint_model');

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
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
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
  const groups = await Class.getGroups();
  if (groups) {
    res.status(200).json({ data: groups });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createGroup = async (req, res) => {
  const groupName = req.body.group_name;
  const result = await Class.createGroup(groupName);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
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
  const classTypeId = req.params.id;
  const routines = await Class.getRoutines(classTypeId);
  if (routines) {
    res.status(200).json({ data: routines });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createRoutine = async (req, res) => {
  const { classRoutine } = res.locals;
  const result = await Class.createRoutine(classRoutine);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const editRoutine = async (req, res) => {
  const { id, classRoutine } = res.locals;
  const result = await Class.editRoutine(id, classRoutine);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Update successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Update failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Update failed due to invalid input' } });
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
// Class teacher manage
const addTeacher = async (req, res) => {
  const { classId, teacherId } = req.params;
  const result = await Class.addTeacher(classId, teacherId);
  if (result === 0) {
    res.status(500).json({ error: 'Create failed' });
  } else {
    res.status(200).json({ data: 'Create successfully' });
  }
};

const removeTeacher = async (req, res) => {
  const { classId, teacherId } = req.params;
  const result = await Class.removeTeacher(classId, teacherId);
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
  const teacherId = req.params.id;
  const classes = await Class.getClasses(teacherId);
  if (classes) {
    res.status(200).json({ data: classes });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const createClass = async (req, res) => {
  const { clas } = res.locals;
  clas.start_date = dayjs(clas.start_date).format('YYYY-MM-DD');
  clas.end_date = dayjs(clas.end_date).format('YYYY-MM-DD');

  const result = await Class.createClass(clas);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const editClass = async (req, res) => {
  const { id, clas } = res.locals;
  clas.start_date = dayjs(clas.start_date).format('YYYY-MM-DD');
  clas.end_date = dayjs(clas.end_date).format('YYYY-MM-DD');

  const result = await Class.editClass(id, clas);
  if (result === 0) {
    res.status(500).json({ error: { message: 'Update failed' } });
  } else if (result === -1) {
    res.status(400).json({ error: { message: 'Update failed due to invalid input' } });
  } else {
    res.status(200).json({ data: { message: 'Update OK' } });
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

const initClassFingerList = async (req, res) => {
  const classId = req.params.id;
  const fingerList = await Fingerprint.getFingerListOfClass(classId);
  if (fingerList === null) {
    return res.status(500).json({ error: { message: 'Delete failed due to server error' } });
  }
  fingerList.forEach((element, index) => { fingerList[index] = element.id; });
  const initRowsStatus = await Fingerprint.initByClass(classId);
  if (initRowsStatus.code > 2000) { return res.status(500).json({ code: initRowsStatus.code, error: { message: 'Internal server Errors' } }); }
  const deleteSensorFingerStatus = await Fingerprint.deleteSensorFingerList(fingerList);
  if (deleteSensorFingerStatus.code > 2000 || (!deleteSensorFingerStatus.code)) { return res.status(500).json({ code: initRowsStatus.code, error: { message: 'Sensor Errors' } }); }
  return res.status(200).json({ code: 1030, data: { message: 'Delete successfully' } });
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
  addTeacher,
  removeTeacher,
  getClasses,
  createClass,
  editClass,
  deleteClass,
  initClassFingerList,
};
