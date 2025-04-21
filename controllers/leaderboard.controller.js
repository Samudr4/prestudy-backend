// controllers/leaderboard.controller.js
const Leaderboard = require('../models/leaderboard.model');

exports.createLeaderboard = async (req, res) => {
  try {
    const { userId, totalScore } = req.body;
    const leaderboardRecord = await Leaderboard.create({ userId, totalScore });
    res.status(201).json({ success: true, data: leaderboardRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ totalScore: -1 }).limit(50);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateScore = async (req, res) => {
  console.log(req.body.userId)
  console.log(req.body.score)
  try {
    const { userId, score } = req.body;
    let leaderboardRecord = await Leaderboard.findOne({ userId });    
    if (!leaderboardRecord) {
      leaderboardRecord = await Leaderboard.create({ userId, totalScore: score });
      console.log(`New user with ID: ${userId} created in leaderboard`);
    } else {
      leaderboardRecord.totalScore += score;
      console.log(`Score updated for existing user with ID: ${userId}. New score: ${leaderboardRecord.totalScore}`);
    }
    await leaderboardRecord.save();        
    res.json({ success: true, data: leaderboardRecord });
  } catch (err) {
    console.error("Error in updateScore:", err); // Log the error for debugging
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { leaderboardId } = req.params;
    const { score } = req.body;

    const leaderboardRecord = await Leaderboard.findById(leaderboardId);

    if (!leaderboardRecord) return res.status(404).json({ success: false, error: 'Leaderboard not found' });
    leaderboardRecord.totalScore += score;

    await leaderboardRecord.save();
    res.json({ success: true, data: leaderboardRecord });
  } catch (error) {
    console.error("Error in updateScore:", error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteLeaderboard = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const leaderboard = await Leaderboard.findByIdAndDelete(leaderboardId);

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
