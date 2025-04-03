const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendVerificationEmail = require('../utils/emailHandler');

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

// @desc    Get logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
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
    // Generate JWT token
    const accessToken = jwt.sign(
      { 
        "UserInfo": {
          "id": user._id,
          "roles": user.role
        }
      }, 
      process.env.ACCESS_TOKEN_SECRET, {
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

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
      // Check for jwt cookie
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(204); // No content

      const refreshToken = cookies.jwt;
      // Check if user exists
      const foundUser = await User.findOne({refreshToken});
      if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
      }

      // 1. removeing the refreshToken from user document
      foundUser.refreshToken = "";
      // 2.Save the updated user document to MongoDB
      const result = await foundUser.save(); // This saves the updated user object with the new refreshToken

        // Clear the jwt cookie
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    refresh accessToken 
// @route   POST /api/auth/refreshToken
exports.refreshToken = async (req, res) => {

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.sendStatus(403);

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || foundUser.id !== decoded.id) return res.sendStatus(403);
      console.log(decoded);
      console.log(foundUser);
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "id": foundUser.id,
            "roles": foundUser.role
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
      );
      res.json({ accessToken })
    }
  );
}

// @desc    Update user profile
// @route   PUT /api/auth/update
exports.updateUser = async (req, res, next) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // 1. Handle Password Strength (if password is being updated)
      if (req.body.password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongRegex.test(req.body.password)) {
          return next(new ErrorResponse(
            'Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character', 
            400
          ));
        }
        user.password = req.body.password; // Will auto-hash via UserSchema pre('save')
      }

      // 2. Handle Email Verification (if email is being changed)
      if (req.body.email && req.body.email !== user.email) {
        user.email = req.body.email;
        user.isEmailVerified = false; // Mark as unverified
        await sendVerificationEmail(req.body.email); // Send verification email
      }

      // 3. Handle Name/Avatar Updates
      if (req.body.name) user.name = req.body.name;
      if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;

      // Save all changes (triggers pre-save hooks for password hashing)
      const updatedUser = await user.save();

      // Exclude password from response
      updatedUser.password = undefined;

      res.status(200).json({
        success: true,
        data: user,
      });
  } catch (error) {
    next(error);
  }
}