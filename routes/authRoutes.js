const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  forgotPassword, 
  resetPassword, 
  logout,
  refreshToken,
  updateUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Protected route
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', protect, logout);
router.post('/refreshToken', refreshToken);
router.put('/update', protect, updateUser);

module.exports = router;