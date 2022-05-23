const { GeneralError } = require('../util/custom_error');
const Leave = require('../models/leave_model');

const getTypes = async () => {
  const types = await Leave.getTypes();
  if (types instanceof Error) { return types; }
  if (types.data.length === 0) { return { code: 1001 }; }
  return { code: 1000, data: types.data };
};

const createType = async (type) => {
  const result = await Leave.createType(type);
  if (result.data) { return { code: 1100, data: { insert_id: result.data.insert_id } }; }
  return result;
};

const deleteType = async (typeId) => {
  const preCheck = await Leave.checkTypeExist(typeId);
  if (preCheck instanceof Error) { return preCheck; }
  if (!preCheck.exist) { return new GeneralError(3001, 'no target year data'); }
  const result = await Leave.deleteType(typeId);
  if (result === null) { return { code: 1300 }; }
  return result;
};

module.exports = {
  getTypes,
  createType,
  deleteType,
};
