const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['system', 'transaction', 'invite'],
    default: 'system'
  },
  relatedEntity: {  // Links to transaction, business, etc.
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Transaction', 'Business', 'User']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
NotificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);