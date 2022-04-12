const Class = require('../models/class_model');

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

module.exports = { getTypes, createType, deleteType };
