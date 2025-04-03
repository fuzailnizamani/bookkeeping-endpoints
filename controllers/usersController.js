const User = require('../models/User');

const getAllUser = async (req, res) => {
  const user = await User.find();
  if (!user) return res.status(204).json({ 'message': 'No Employees found.' });
  res.json(user);
};

const deleteUser = async (req, res) => {
  const userId = req.body.id; // Check body for id
  if (!userId) {
    return res.status(400).json({ "message": "Employee ID required." });
  }
  const result = await User.findOneAndDelete({ _id: userId });
  if (!result) {
    return res.status(204).json({ "message": `No employee matches ID ${employeeId}` });
  }
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ "message": 'ID parameter is required.' });
  }
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    return res.status(204).json({ "message": `No employee matches ID ${req.params.id}` });
  }
  res.json(user);
};

module.exports = {
  getAllUser,
  deleteUser,
  getUser
};