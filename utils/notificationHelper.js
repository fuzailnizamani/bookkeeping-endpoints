const Notification = require('../models/Notification');

exports.createNotification = async ({
  userId,
  message,
  type = 'system',
  relatedEntityId,
  onModel
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      relatedEntity: relatedEntityId,
      onModel
    });
    return notification;
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};