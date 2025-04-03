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
const { protect , authorize} = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Protected route
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', protect, logout);
router.post('/refreshToken', refreshToken);
router.put('/update', protect, updateUser);
// Only 'business' role can access this
router.get(
  '/dashboard',
  protect,          // Requires JWT
  authorize('business'), // Checks role
  (req, res) => {
    res.json({ success: true, data: "Business Dashboard" });
  }
);

module.exports = router;