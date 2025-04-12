const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

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
  return async (req, res, next) => {
    const business = await Business.findById(req.params.businessId);
    const employee = business.employees.find(
      emp => emp.user.toString() === req.user.id
    );
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized`,
      });
    }
    next();
  };
};

exports.checkBusinessOwnership = async (req, res, next) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) {
    return next(new ErrorResponse('Business not found', 404));
  }

  if (business.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  req.business = business;
  next();
};