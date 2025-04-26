// routes/quiz.routes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Quiz CRUD operations
router.post('/', quizController.createQuiz);
router.get('/category/:categoryId', quizController.getQuizzesByCategoryId);
router.get('/:quizId', quizController.getQuizById);
router.post('/:quizId/questions', quizController.addQuestion);

// Quiz results
router.post('/:quizId/results', quizController.submitQuizResult);
router.get('/user/:userId/results', quizController.getUserQuizResults);
router.get('/results/:resultId', quizController.getQuizResult);

module.exports = router; 