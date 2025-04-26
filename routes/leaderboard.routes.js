// routes/leaderboard.routes.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

// Get leaderboard data
router.get('/', leaderboardController.getLeaderboard);

// Get a specific user's rank and score
router.get('/user/:userId', leaderboardController.getUserRank);

// Update a user's score (after completing a quiz)
router.post('/user/:userId/score', leaderboardController.updateUserScore);

module.exports = router;
