const FingerPrint = require('../models/fingerprint_model');

const { NODE_ENV } = process.env;

const turnOnIdentify = async (req, res) => {
  if (NODE_ENV === 'demo') { return res.status(200).json({ code: 1010, data: { message: 'Trying to turn on Identify mode' } }); }
  const result = await FingerPrint.turnOnIdentify();
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Trying to turn on Identify mode' } });
  }
  return res.status(500).json({ code: result.code, error: { message: 'Failed to turn on Identify mode' } });
};

const stopSensor = async (req, res) => {
  if (NODE_ENV === 'demo') { return res.status(200).json({ code: 1011, data: { message: 'Trying to turn on Identify mode' } }); }
  const result = await FingerPrint.stopSensor();
  if (result.code < 2000) {
    return res.status(200).json({ code: result.code, data: { message: 'Stop sensor successfully' } });
  }
  return res.status(500).json({ code: result.code, error: { message: 'Stop sensor failed' } });
};

module.exports = { turnOnIdentify, stopSensor };
