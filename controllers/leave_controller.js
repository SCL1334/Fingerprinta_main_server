const dayjs = require('dayjs');
const Leave = require('../models/leave_model');
const Class = require('../models/class_model');
const LeaveService = require('../service/leave_service');
const { timeStringToMinutes, getDefaultLeaveHours } = require('../util/time_transformer');
const { getS3Url } = require('../util/aws_s3');
const ResponseTransformer = require('../util/response');

const { REST_START, REST_END } = process.env;

// Type Manage
const getTypes = async (req, res) => {
  const result = await LeaveService.getTypes();
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const createType = async (req, res) => {
  const { leaveType } = res.locals;
  const result = await LeaveService.createType(leaveType);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
};

const deleteType = async (req, res) => {
  const typeId = req.params.id;
  const result = await LeaveService.deleteType(typeId);
  const transformer = new ResponseTransformer(result);
  res.status(transformer.httpCode).json(transformer.response);
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
    return res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  }
  return res.status(200).json({ code: 1000, data: leaves });
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
    return res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  }
  return res.status(200).json({ code: 1000, data: leaves });
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
    return res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  }
  return res.status(200).json({ code: 1000, data: leaves });
};

const getSelfLeaves = async (req, res) => {
  const studentId = req.session.user.student_id;
  let { from, to } = req.query;
  if (from && to) {
    from = dayjs(from).format('YYYY-MM-DD');
    to = dayjs(to).format('YYYY-MM-DD');
  } else if ((from && !to) || (!from && to)) {
    return res.status(400).json({ code: 3000, error: { message: 'Input lack of parameter' } });
  }
  const leaves = await Leave.getPersonLeaves(studentId, from, to);
  if (!leaves) {
    return res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  }
  return res.status(200).json({ code: 1000, data: leaves });
};

const backupClassLeaves = async (req, res) => {
  const classId = req.params.id;
  const clas = await Class.getOneClass(classId);
  const className = `${clas.class_type_name}-${clas.batch}-${clas.class_group_name}`;
  const leavesRaw = await Leave.checkClassValidLeaves(classId);
  const leaves = leavesRaw.reduce((acc, cur) => {
    acc.push([cur.student_name, cur.date, cur.start, cur.end,
      cur.hours, cur.leave_type_name, cur.reason, cur.note]);
    return acc;
  }, [['學生姓名', '請假日期', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假類型', '請假原因', '校務人員註記']]);
  const result = await Leave.backupClassLeaves(className, leaves);
  if (result.code < 2000) {
    res.status(200).json({
      code: result.code,
      data: { message: result.message, location: result.location },
    });
  } else {
    res.status(500).json({ code: result.code, error: { message: result.message } });
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

const countSelfLeavesHours = async (req, res) => {
  const studentId = req.session.user.student_id;
  const leavesHours = await Leave.countLeavesHours(studentId);
  if (leavesHours !== 0 && !leavesHours) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leavesHours });
  }
};

const countAllLeavesHours = async (req, res) => {
  const leavesHours = await Leave.countAllLeavesHours();
  if (!leavesHours) {
    res.status(500).json({ code: 2000, error: { message: 'Read failed' } });
  } else {
    res.status(200).json({ code: 1000, data: leavesHours });
  }
};

const transferLackAttendance = async (req, res) => {
  const { leave } = res.locals;
  const studentId = leave.student_id;
  const {
    leave_type_id: leaveTypeId, date, start, end, hours,
    reason, note, certificate_url: certificateUrl,
  } = leave;

  const leaveTypes = await Leave.getTypes();
  if (leaveTypes instanceof Error) {
    const transformer = new ResponseTransformer(leaveTypes);
    return res.status(transformer.httpCode).json(transformer.response);
  }
  const leaveTypesTable = leaveTypes.data.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
  let leaveHours = 0;
  if (leaveTypesTable[leaveTypeId].need_calculate === 1) {
    leaveHours = getDefaultLeaveHours(start, end, REST_START, REST_END);
  }

  const leaveTransform = {
    student_id: studentId,
    leave_type_id: leaveTypeId,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    hours: (typeof hours === 'number') ? hours : leaveHours,
    reason,
    note,
    certificate_url: certificateUrl,
    approval: true,
  };
  const result = await Leave.applyLeave(leaveTransform);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  }
  if (result.code < 3000) {
    return res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  }
  return res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
};

const applyLeave = async (req, res) => {
  const { leave } = res.locals;

  const studentId = leave.student_id;
  const {
    leave_type_id: leaveTypeId, date, start, end, reason, note, certificate_url: certificateUrl,
  } = leave;
  const { leaves_hours: accLeaveHours } = await Leave.countLeavesHours(leave.student_id);

  const leaveLimit = (process.env.LEAVE_HOUR_LIMIT)
    ? parseInt(process.env.LEAVE_HOUR_LIMIT, 10) : Number.POSITIVE_INFINITY;

  if (accLeaveHours > leaveLimit) {
    return res.status(423).json({ code: 423, error: { message: 'Leave hours over limit' } });
  }

  const leaveTypes = await Leave.getTypes();
  if (leaveTypes instanceof Error) {
    const transformer = new ResponseTransformer(leaveTypes);
    return res.status(transformer.httpCode).json(transformer.response);
  }

  const leaveTypesTable = leaveTypes.data.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});

  if (!(leaveTypeId in leaveTypesTable)) {
    return res.status(400).json({ code: 3003, error: { message: 'Invalid leave type id' } });
  }
  let leaveHours = 0;
  if (leaveTypesTable[leaveTypeId].need_calculate === 1) {
    leaveHours = getDefaultLeaveHours(start, end, REST_START, REST_END);
  }

  const leaveTransform = {
    student_id: studentId,
    leave_type_id: leaveTypeId,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    reason,
    note,
    hours: leaveHours,
    certificate_url: certificateUrl,
  };

  const result = await Leave.applyLeave(leaveTransform);
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { insert_id: result.insert_id, message: 'Create successfully' } });
  }
  if (result.code < 3000) {
    return res.status(500).json({ code: result.code, error: { message: 'Create failed' } });
  }
  return res.status(400).json({ code: result.code, error: { message: 'Create failed due to invalid input' } });
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
  const { id, leave } = res.locals;

  const {
    leave_type_id: leaveTypeId, reason, note, approval, date, start, end,
  } = leave;
  const { hours } = leave;

  const leaveTypes = await Leave.getTypes();
  if (leaveTypes instanceof Error) {
    const transformer = new ResponseTransformer(leaveTypes);
    return res.status(transformer.httpCode).json(transformer.response);
  }
  const leaveTypesTable = leaveTypes.data.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
  let leaveHours = 0;
  if (leaveTypesTable[leaveTypeId].need_calculate === 1) {
    leaveHours = getDefaultLeaveHours(start, end, REST_START, REST_END);
  }

  const leaveTransform = {
    leave_type_id: leaveTypeId,
    reason,
    note,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    approval,
    hours: (typeof hours === 'number') ? hours : leaveHours,
  };
  const status = await Leave.updateLeave(id, leaveTransform);
  if (status < 2000) {
    return res.status(200).json({ code: status, data: { message: 'Update successfully' } });
  }
  if (status < 3000) {
    return res.status(500).json({ code: status, error: { message: 'Updatefailed' } });
  }
  return res.status(400).json({ code: status, error: { message: 'Update failed due to invalid input' } });
};

const updateSelfLeave = async (req, res) => {
  const { id, leave } = res.locals;
  const studentId = req.session.user.student_id;
  const {
    leave_type_id: leaveTypeId, reason, date, start, end,
  } = leave;

  let leaveHours;
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

  const leaveTransform = {
    leave_type_id: leaveTypeId,
    reason,
    date: dayjs(date).format('YYYY-MM-DD'),
    start,
    end,
    hours: leaveHours,
  };
  const status = await Leave.updateSelfLeave(studentId, id, leaveTransform);
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Update successfully' } });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Update failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Update failed due to invalid input' } });
  }
};

const deleteLeave = async (req, res) => {
  const leaveId = req.params.id;
  const status = await Leave.deleteLeave(leaveId);
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Delete successfully' } });
  } else if (status < 3000) {
    res.status(500).json({ code: status, error: { message: 'Delete failed' } });
  } else {
    res.status(400).json({ code: status, error: { message: 'Delete failed due to invalid input' } });
  }
};

const deleteSelfLeave = async (req, res) => {
  const leaveId = req.params.id;
  const studentId = req.session.user.student_id;
  const status = await Leave.deleteSelfLeave(studentId, leaveId);
  if (status < 2000) {
    res.status(200).json({ code: status, data: { message: 'Delete successfully' } });
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

const getSelfS3UrlForCertificate = async (req, res) => {
  const id = req.session.user.student_id;
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
  backupClassLeaves,
  getPersonLeaves,
  countLeavesHours,
  countAllLeavesHours,
  applyLeave,
  auditLeave,
  updateLeave,
  deleteLeave,
  transferLackAttendance,
  getS3UrlForCertificate,
  getSelfLeaves,
  countSelfLeavesHours,
  updateSelfLeave,
  deleteSelfLeave,
  getSelfS3UrlForCertificate,
};
