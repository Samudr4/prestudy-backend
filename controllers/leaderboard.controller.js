// controllers/leaderboard.controller.js
const Leaderboard = require('../models/leaderboard.model');
const User = require('../models/user.model');

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
    const { timeframe = 'all' } = req.query; // 'day', 'week', 'month', 'all'
    
    // Calculate date thresholds based on timeframe
    const now = new Date();
    let dateThreshold = new Date(0); // Start of epoch time
    
    if (timeframe === 'day') {
      // Last 24 hours
      dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      // Last 7 days
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      // Last 30 days
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Find leaderboard entries updated after the threshold date
    const leaderboardEntries = await Leaderboard.find({
      updatedAt: { $gte: dateThreshold }
    })
    .sort({ score: -1 }) // Sort by score in descending order
    .limit(50); // Limit to top 50 users
    
    // Get user details for each leaderboard entry
    const leaderboardWithUserDetails = await Promise.all(
      leaderboardEntries.map(async (entry, index) => {
        const user = await User.findById(entry.userId);
        return {
          rank: index + 1,
          userId: entry.userId,
          name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
          score: entry.score,
          achievements: entry.achievements || [],
          quizzesTaken: entry.quizzesTaken || 0
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      timeframe,
      data: leaderboardWithUserDetails
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard data',
      error: error.message
    });
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

// Get a specific user's rank and score
exports.getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find the user's leaderboard entry
    const userEntry = await Leaderboard.findOne({ userId });
    
    if (!userEntry) {
      return res.status(404).json({
        success: false,
        message: 'User not found on the leaderboard'
      });
    }
    
    // Count how many users have a higher score
    const higherScores = await Leaderboard.countDocuments({
      score: { $gt: userEntry.score }
    });
    
    // User's rank (1-based)
    const rank = higherScores + 1;
    
    // Get user details
    const user = await User.findById(userId);
    
    return res.status(200).json({
      success: true,
      data: {
        rank,
        userId: userEntry.userId,
        name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
        score: userEntry.score,
        achievements: userEntry.achievements || [],
        quizzesTaken: userEntry.quizzesTaken || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message
    });
  }
};

// Update a user's score
exports.updateUserScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { score, quizId } = req.body;
    
    if (!userId || !score || !quizId) {
      return res.status(400).json({
        success: false,
        message: 'User ID, score, and quiz ID are required'
      });
    }
    
    // Find or create leaderboard entry
    let leaderboardEntry = await Leaderboard.findOne({ userId });
    
    if (!leaderboardEntry) {
      leaderboardEntry = new Leaderboard({
        userId,
        score: 0,
        quizzesTaken: 0,
        achievements: []
      });
    }
    
    // Update score and quizzes taken
    leaderboardEntry.score += parseInt(score);
    leaderboardEntry.quizzesTaken += 1;
    
    // Add achievements logic here (e.g., first quiz, high score, etc.)
    
    // Save the updated entry
    await leaderboardEntry.save();
    
    return res.status(200).json({
      success: true,
      message: 'Leaderboard updated successfully',
      data: leaderboardEntry
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update leaderboard',
      error: error.message
    });
  }
};
