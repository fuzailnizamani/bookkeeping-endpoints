const express = require('express');
const router = express.Router();
const { verifyEmail } = require('../controllers/authController');
const { protect , authorize} = require('../middleware/authMiddleware');

router.get('/verify-email', verifyEmail);

module.exports = router;