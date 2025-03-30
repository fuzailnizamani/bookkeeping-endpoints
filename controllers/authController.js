const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    const roles = Object.values(user.role);
    // Generate JWT token
    const accessToken = jwt.sign(
      { 
        "UserInfo": {
          "id": user._id,
          "roles": roles
        }
      }, 
      process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    const refreshToken = jwt.sign(
      { "id": user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // 1. Add the refreshToken to the foundUser document
    user.refreshToken = refreshToken;
    // 2.Save the updated user document to MongoDB
    const result = await user.save(); // This saves the updated user object with the new refreshToken

    res.cookie('jwt', refreshToken, {
      httpOnly: true, // Prevents JavaScript access (security)
      sameSite: 'None', // Allows cross-site requests (important for frontend-backend comm.)
      secure: false, // Set this to `true` for production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000 // Set cookie expiry time (1 day)
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    console.log(req);
    const user = await User.findById(req.user.id);
    if(!user){
      res.status(404).json({ fail: 'user not match with this id'});
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message , text:'error'});
  }
};

// @desc    Forgot password (generate reset token)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate reset token (saved in DB)
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes expiry
    await user.save();

    // In production: Send email with resetToken (e.g., via Nodemailer)
    console.log(`Reset token: ${resetToken}`); // For testing only

    res.status(200).json({
      success: true,
      message: 'Password reset token sent',
      token: resetToken, // Only for testing (remove in production)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash token to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Check expiry
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Update password and clear token
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT (optional)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};