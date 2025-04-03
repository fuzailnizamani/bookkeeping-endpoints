const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes (JWT verification)
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.UserInfo.id);
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

// Role-based access control (e.g., 'business', 'employee')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized`,
      });
    }
    next();
  };
};