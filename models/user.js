//models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  referralCode: String,
  referralParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralPercentage: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);
