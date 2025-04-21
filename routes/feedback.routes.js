// routes/feedback.routes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Example routes
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback); 
router.put('/:feedbackId', feedbackController.updateFeedback);
router.delete('/:feedbackId', feedbackController.deleteFeedback);

module.exports = router;
