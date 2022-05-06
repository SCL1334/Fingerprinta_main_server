require('dotenv').config();
const dayjs = require('dayjs');
const Leave = require('../models/leave_model');
const { timeStringToMinutes, getS3Url } = require('../util/util');

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

const countLeavesHours = async (req, res) => {
  const studentId = req.params.id;
  const leavesHours = await Leave.countLeavesHours(studentId);
  if (leavesHours !== 0 && !leavesHours) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leavesHours });
  }
};

const transferLackAttendance = async (req, res) => {
  const studentId = req.params.id;
  const {
    leave_type_id: leaveTypeId, date, start, end, hours,
    reason, note, certificate_url: certificateUrl,
  } = req.body;

  const leaveTypes = await Leave.getTypes();
  const leaveTypesTable = leaveTypes.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
  let leaveHours = 0;
  if (leaveTypesTable[leaveTypeId].need_calculate === 1) {
    const startMin = timeStringToMinutes(start);
    const endMin = timeStringToMinutes(end);
    const restStart = timeStringToMinutes('12:00:00');
    const restEnd = timeStringToMinutes('13:00:00');

    const minToHours = (min) => Math.ceil(min / 60);

    if (startMin <= restStart && endMin >= restEnd) { // 正常情況 start && end 都不在Rest範圍
      leaveHours = minToHours(restStart - startMin + endMin - restEnd);
    } else if (startMin >= restEnd || endMin <= restStart) { // 沒有重疊到Rest
      leaveHours = minToHours(endMin - startMin);
    } else if (startMin <= restStart && endMin < restEnd) { // end 在 Rest中
      leaveHours = minToHours(restStart - startMin);
    } else if (startMin >= restStart && endMin <= restEnd) { // start end 皆落在Rest範圍
      leaveHours = 0;
    } else if (startMin >= restStart && endMin > restEnd) { // start 在Rest中
      leaveHours = minToHours(endMin - restEnd);
    }
  }

  const leave = {
    student_id: studentId,
    leave_type_id: leaveTypeId,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    hours: hours || leaveHours,
    reason,
    note,
    certificate_url: certificateUrl,
    approval: true,
  };
  const result = await Leave.applyLeave(leave);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const applyLeave = async (req, res) => {
  const studentId = req.params.id;
  const {
    leave_type_id: leaveTypeId, date, start, end, reason, note, certificate_url: certificateUrl,
  } = req.body;
  const accLeaveHours = await Leave.countLeavesHours(studentId).leaves_hours;

  let { hours } = req.body;

  const { user } = req.session;
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }
  if (user.role !== 'staff') {
    if (accLeaveHours > process.env.LEAVE_HOUR_LIMIT || 0) {
      return res.status(403).json({ error: { message: 'Leave Hours over limit' } });
    }
    hours = null;
  }
  const leaveTypes = await Leave.getTypes();
  const leaveTypesTable = leaveTypes.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
  let leaveHours = 0;
  if (leaveTypesTable[leaveTypeId].need_calculate === 1) {
    const startMin = timeStringToMinutes(start);
    const endMin = timeStringToMinutes(end);
    const restStart = timeStringToMinutes('12:00:00');
    const restEnd = timeStringToMinutes('13:00:00');

    const minToHours = (min) => Math.ceil(min / 60);

    if (startMin <= restStart && endMin >= restEnd) { // 正常情況 start && end 都不在Rest範圍
      leaveHours = minToHours(restStart - startMin + endMin - restEnd);
    } else if (startMin >= restEnd || endMin <= restStart) { // 沒有重疊到Rest
      leaveHours = minToHours(endMin - startMin);
    } else if (startMin <= restStart && endMin < restEnd) { // end 在 Rest中
      leaveHours = minToHours(restStart - startMin);
    } else if (startMin >= restStart && endMin <= restEnd) { // start end 皆落在Rest範圍
      leaveHours = 0;
    } else if (startMin >= restStart && endMin > restEnd) { // start 在Rest中
      leaveHours = minToHours(endMin - restEnd);
    }
  }

  const leave = {
    student_id: studentId,
    leave_type_id: leaveTypeId,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    reason,
    note,
    hours: hours || leaveHours,
    certificate_url: certificateUrl,
  };

  const result = await Leave.applyLeave(leave);
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  } else if (result.code < 3000) {
    res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  } else {
    res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
  }
};

const auditLeave = async (req, res) => {
  const leaveId = req.params.id;
  const audit = req.body.approval;
  const status = await Leave.updateLeave(leaveId, { approval: audit });
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Approve successfully' });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Approve failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Approve failed due to invalid input' } });
  }
};

const updateLeave = async (req, res) => {
  const leaveId = req.params.id;
  const {
    leave_type_id, reason, note, date, start, end, approval, hours,
  } = req.body;
  const { user } = req.session;
  if (!user || !user.email) { return res.status(401).json({ error: 'Unauthorized' }); }

  if (user.role !== 'staff') {
    hours = null;
    approval = null;
  }

  let leaveHours;
  const startMin = timeStringToMinutes(start);
  const endMin = timeStringToMinutes(end);
  const restStart = timeStringToMinutes('12:00:00');
  const restEnd = timeStringToMinutes('13:00:00');

  const minToHours = (min) => Math.ceil(min / 60);

  if (start <= restStart && end >= restEnd) { // 正常情況 start && end 都不在Rest範圍
    leaveHours = minToHours(restStart - startMin + endMin - restEnd);
  } else if (startMin >= restEnd || endMin <= restStart) { // 沒有重疊到Rest
    leaveHours = minToHours(endMin - startMin);
  } else if (startMin <= restStart && endMin < restEnd) { // end 在 Rest中
    leaveHours = minToHours(restStart - startMin);
  } else if (startMin >= restStart && endMin <= restEnd) { // start end 皆落在Rest範圍
    leaveHours = 0;
  } else if (startMin >= restStart && endMin > restEnd) { // start 在Rest中
    leaveHours = minToHours(endMin - restEnd);
  }

  const leave = {
    leave_type_id,
    reason,
    note,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    approval,
    hours: hours || leaveHours,
  };
  const status = await Leave.updateLeave(leaveId, leave);
  if (status < 2000) {
    res.status(200).json({ code: status, data: 'Update successfully' });
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

const getS3UrlForCertificate = async (req, res) => {
  const { id } = req.params;
  // gen new name
  const newImageName = parseInt(dayjs().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 10000), 10);
  // set apply
  const path = `leave_certificate/students/${id}/${newImageName}.jpg`;
  const uploadURL = await getS3Url(path);
  // send url to frontend
  if (uploadURL) {
    res.status(200).json({ data: { url: uploadURL } });
  } else {
    res.status(500).json({ error: { message: 'Fail to get s3 url' } });
  }
};

module.exports = {
  getTypes,
  createType,
  deleteType,
  getAllLeaves,
  getClassLeaves,
  getPersonLeaves,
  countLeavesHours,
  applyLeave,
  auditLeave,
  updateLeave,
  deleteLeave,
  transferLackAttendance,
  getS3UrlForCertificate,
};
