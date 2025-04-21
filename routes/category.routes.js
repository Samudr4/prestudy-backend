// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

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

module.exports = router;
