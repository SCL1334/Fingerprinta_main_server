const User = require('../models/user_model');
const Fingerprint = require('../models/fingerprint_model');

const createAccount = async (req, res) => {
  const {
    name, account, password, class_id,
  } = req.body;
  let { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Invalid input' });
  role = role.toUpperCase();
  // Admin: 0, Teacher: 1, Student:2
  let roleId;
  if (role === 'TEACHER') {
    roleId = 1;
  } else if (role === 'STUDENT') {
    roleId = 2;
  } else {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const result = await User.createAccount(name, account, password, class_id, roleId);
  if (result === 0) {
    return res.status(500).json({ error: 'Create failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Create failed due to invalid input' });
  }
  return res.status(200).json({ data: 'Create successfully' });
};

const getAccounts = async (req, res) => {
  const accounts = await User.getAccounts();
  if (accounts) {
    res.status(200).json({ data: accounts });
  } else {
    res.status(500).json({ error: 'Read failed' });
  }
};

const deleteAccount = async (req, res) => {
  const userId = req.body.user_id;
  const result = await User.deleteAccount(userId);
  if (result === 0) {
    res.status(500).json({ error: 'Delete failed' });
  } else if (result === -1) {
    res.status(400).json({ error: 'Delete failed due to invalid input' });
  } else {
    res.status(200).json({ data: 'Delete successfully' });
  }
};

const signIn = async (req, res) => {
  const { account, password } = req.body;
  const result = await User.signIn(account, password);
  if (result === 0) {
    return res.status(500).json({ error: 'Signin failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Signin failed due to invalid input' });
  }
  req.session.account = account;
  return res.status(200).json({ data: 'Signin successfully' });
};

const matchFingerprint = async (req, res) => {
  const userId = req.body.user_id;
  const fingerId = await Fingerprint.getEnrollId();
  if (fingerId === -1) {
    return res.status(400).json({ error: 'Match failed due to enroll failed' });
  }
  if (fingerId === -2) {
    res.status(500).json({ error: 'Match failed due to sensor disconnect' });
  }
  const result = await User.matchFingerprint(userId, fingerId);
  if (result === 0) {
    return res.status(500).json({ error: 'Match failed' });
  }
  if (result === -1) {
    return res.status(400).json({ error: 'Match failed due to invalid input' });
  }
  return res.status(200).json({ data: 'Match OK' });
};

module.exports = {
  createAccount, getAccounts, deleteAccount, signIn, matchFingerprint,
};
