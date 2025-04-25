// controllers/category.controller.js
const Category = require('../models/category.model');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, description, image, order } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Name and type are required." });
    }

    const category = await Category.create({
      name,
      type,
      description,
      image,
      order: order || 0,
      isActive: true,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get all Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get categories by type
exports.getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.query; // e.g., type=exam or type=course
    const query = type ? { type } : {};
    const categories = await Category.find(query);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get categories by type and level
exports.getCategoriesByTypeAndLevel = async (req, res) => {
  try {
    const { type } = req.query; // e.g., type=course or type=exam
    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    const query = { type, isActive: true }; // Fetch only active categories
    const categories = await Category.find(query).sort({ order: 1 }); // Sort by order
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get complete category tree
exports.getCategoryTree = async (req, res) => {
  try {
    const rootCategories = await Category.find({ parentCategory: null, isActive: true }).sort({ order: 1 });

    const getChildren = async (parentId) => {
      const children = await Category.find({ parentCategory: parentId, isActive: true }).sort({ order: 1 });
      return Promise.all(
        children.map(async (child) => ({
          ...child.toObject(),
          subcategories: await getChildren(child._id),
        }))
      );
    };

    const categoryTree = await Promise.all(
      rootCategories.map(async (root) => ({
        ...root.toObject(),
        subcategories: await getChildren(root._id),
      }))
    );

    res.json({ success: true, data: categoryTree });
  } catch (error) {
    console.error("Error building category tree:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { parentCategory } = req.body;

    // If parent category is being updated, recalculate level
    if (parentCategory !== undefined) {
      const parent = await Category.findById(parentCategory);
      req.body.level = parent ? parent.level + 1 : 0;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Delete a category and its subcategories
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Recursively find and delete all subcategories
    const deleteSubcategories = async (parentId) => {
      const subcategories = await Category.find({ parentCategory: parentId });
      for (const subcat of subcategories) {
        await deleteSubcategories(subcat._id);
        await Category.findByIdAndDelete(subcat._id);
      }
    };

    // Delete the main category and its subcategories
    await deleteSubcategories(categoryId);
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category and all subcategories deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
