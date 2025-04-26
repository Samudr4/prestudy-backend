// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const quizController = require('../controllers/quiz.controller');

// Create a new category
router.post('/', categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get categories by type and level
router.get('/byType', categoryController.getCategoriesByTypeAndLevel);

// Get complete category tree
router.get('/tree', categoryController.getCategoryTree);

// Update a category
router.put('/:categoryId', categoryController.updateCategory);

// Delete a category and its subcategories
router.delete('/:categoryId', categoryController.deleteCategory);

// Quiz routes
// Get all quizzes for a category
router.get('/:categoryId/quizzes', quizController.getQuizzesByCategory);

// Get a specific quiz
router.get('/quiz/:quizId', quizController.getQuizById);

// Create a new quiz in a category
router.post('/:categoryId/quizzes', quizController.createQuiz);

// Submit quiz answers
router.post('/quiz/:quizId/submit', quizController.submitQuiz);

module.exports = router;
