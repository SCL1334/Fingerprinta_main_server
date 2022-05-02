const FingerPrint = require('../models/fingerprint_model');

const turnOnIdentify = async (req, res) => {
  const result = await FingerPrint.turnOnIdentify();
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Trying to turn on Identify mode' } });
  } else {
    res.status(500).json({ code: result.code, error: { message: 'Failed to turn on Identify mode' } });
  }
};

const stopSensor = async (req, res) => {
  const result = await FingerPrint.stopSensor();
  if (result.code < 2000) {
    res.status(200).json({ code: result.code, data: { message: 'Stop sensor successfully' } });
  } else {
    res.status(500).json({ code: result.code, error: { message: 'Stop sensor failed' } });
  }
};

module.exports = { turnOnIdentify, stopSensor };
