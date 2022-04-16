const dayjs = require('dayjs');
const Leave = require('../models/leave_model');

// Type Manage
const getTypes = async (req, res) => {
  const types = await Leave.getTypes();
  if (types) {
    res.status(200).json({ code: 1000, data: types });
  } else {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  }
};

const createType = async (req, res) => {
  const typeName = req.body.type_name;
  const status = await Leave.createType(typeName);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Create successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Create failed due to invalid input' } });
  }
};

const deleteType = async (req, res) => {
  const typeId = req.params.id;
  const status = await Leave.deleteType(typeId);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Delete successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Delete failed' } });
  } else if (status === 3030) {
    res.status(409).json({ code: status, error: { message: 'Delete failed, Conflict' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Delete failed due to invalid input' } });
  }
};

// Manage leaves
const getAllLeaves = async (req, res) => {
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ code: 3000, error: { message: 'Input lack of parameter' } });
  }
  const leaves = await Leave.getAllLeaves(from, to);
  if (!leaves) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leaves });
  }
};

const getClassLeaves = async (req, res) => {
  const classId = req.params.id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ code: 3000, error: { message: 'Input lack of parameter' } });
  }
  const leaves = await Leave.getClassLeaves(classId, from, to);
  if (!leaves) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leaves });
  }
};

const getPersonLeaves = async (req, res) => {
  const studentId = req.params.id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ code: 3000, error: { message: 'Input lack of parameter' } });
  }
  const leaves = await Leave.getPersonLeaves(studentId, from, to);
  if (!leaves) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leaves });
  }
};

const applyLeave = async (req, res) => {
  const studentId = req.params.id;
  const {
    leave_type_id, description, date, start, end,
  } = req.body;
  const leave = {
    student_id: studentId,
    leave_type_id,
    description,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
  };
  const status = await Leave.applyLeave(leave);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Create successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Create failed due to invalid input' } });
  }
};

const approveLeave = async (req, res) => {
  const leaveId = req.params.id;
  const status = await Leave.approveLeave(leaveId);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Approve successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Approve failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Approve failed due to invalid input' } });
  }
};

const deleteLeave = async (req, res) => {
  const leaveId = req.params.id;
  const status = await Leave.deleteLeave(leaveId);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Delete successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Delete failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Delete failed due to invalid input' } });
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
  approveLeave,
  deleteLeave,
};
