const Fingerprint = require('../models/fingerprint_model');

const getFingerQuota = async (req, res) => {
  const quotas = await Fingerprint.getFingerQuota();
  if (quotas) {
    res.status(200).json({ data: quotas });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

module.exports = { getFingerQuota };
