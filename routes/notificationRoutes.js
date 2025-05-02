const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/mark-read', protect, markAsRead);

module.exports = router;