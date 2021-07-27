const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name!'],
    },
    email: {
      type: String,
      required: [true, 'User must have an email!'],
      lowercase: true,
      unique: [true, 'Email must be unique!'],
      validate: [validator.isEmail, 'Email must be valid!'],
    },
    username: {
      type: String,
      unique: [true, 'Username must be unique'],
      required: [true, 'User must have a username'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: 8,
      select: false,
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'root'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: false,
    },
    accountCreatedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordChangedAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);
  const payload = {
    id: this._id,
    email: this.email,
    username: this.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });
};

userSchema.methods.generatePasswordResetToken = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
