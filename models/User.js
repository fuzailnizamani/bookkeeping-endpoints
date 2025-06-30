const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password in queries
  },
  role: {
    type: String,
    enum: ['user', 'business', 'employee', 'Admin'],
    default: 'user',
  },
  resetPasswordToken: {
    type: String,
    required: (false)
  },
  resetPasswordExpire: {
    type: Date,
    required: (false)
  },
  refreshToken: {
    type: String,
    required: (false)
  },
  isEmailVerified: {
    type: Boolean,
    required: (true),
    default: false
  },
  newEmail: {
    type: String,
  },
  // ... existing fields ...
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  }],
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);