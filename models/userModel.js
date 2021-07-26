const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
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
    select: false,
    default: false,
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetExpires: {
    type: Date,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
