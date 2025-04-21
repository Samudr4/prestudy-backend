// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    // Additional fields as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
