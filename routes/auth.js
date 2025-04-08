const express = require('express');
const router = express.Router();
const { verifyEmail,updateEmail } = require('../controllers/authController');
const { protect} = require('../middleware/authMiddleware');

router.put('/request-email-change', protect, updateEmail);
router.get('/verify-email-change/:token', verifyEmail);

module.exports = router;