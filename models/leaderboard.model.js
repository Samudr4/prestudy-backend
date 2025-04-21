// models/leaderboard.model.js
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalScore: { type: Number, default: 0 },
    // Possibly track ranks, best times, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
