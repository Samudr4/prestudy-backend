// routes/leaderboard.routes.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

router.post('/', leaderboardController.createLeaderboard);
router.get('/', leaderboardController.getLeaderboard);
router.put('/:leaderboardId', leaderboardController.updateScore);
router.delete('/:leaderboardId', leaderboardController.deleteLeaderboard);

module.exports = router;
