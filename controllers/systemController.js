const { createNotification } = require('../utils/notificationHelper');
const User = require('../models/User');

exports.sendSystemAlert = async (req, res, next) => {
  try {
    // Example: Notify all users about maintenance
    const users = await User.find();

    await Promise.all(
      users.map(user => 
        createNotification({
          userId: user._id,
          message: 'System maintenance scheduled for Saturday 10PM UTC',
          type: 'system'
        })
      )
    );

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};