// models/feedback.model.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
