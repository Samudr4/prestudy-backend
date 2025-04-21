const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['exam', 'course'], required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String },
  image: { type: String },
  level: { type: Number, default: 0 }, // 0 for main categories, 1 for subcategories, etc.
  order: { type: Number, default: 0 }, // For custom ordering of categories
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
});

// Add index for faster querying
categorySchema.index({ parentCategory: 1, type: 1, level: 1 });

module.exports = mongoose.model('Category', categorySchema);

const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
  try {
    const { name, parentCategory, description, image } = req.body;
    const category = await Category.create({ name, parentCategory, description, image });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { parentCategory } = req.query; // Optional filter for subcategories
    const query = parentCategory ? { parentCategory } : { parentCategory: null };
    const categories = await Category.find(query);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true });
    if (!updatedCategory) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
