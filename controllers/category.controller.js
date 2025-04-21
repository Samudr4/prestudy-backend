// controllers/category.controller.js
const Category = require('../models/category.model');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, parentCategory, description, image, order } = req.body;
    
    // Calculate level based on parent
    let level = 0;
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (parent) {
        level = parent.level + 1;
      }
    }

    const category = await Category.create({ 
      name, 
      type, 
      parentCategory, 
      description, 
      image,
      level,
      order: order || 0
    });
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
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
    const { type, level, parentCategory } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (level) query.level = parseInt(level);
    if (parentCategory) {
      query.parentCategory = parentCategory === 'null' ? null : parentCategory;
    }

    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .populate('parentCategory', 'name type');
      
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get complete category tree
exports.getCategoryTree = async (req, res) => {
  try {
    // First get all root categories (level 0)
    const rootCategories = await Category.find({ level: 0 })
      .sort({ order: 1, name: 1 });

    // Function to recursively get children
    const getChildren = async (parentId) => {
      const children = await Category.find({ parentCategory: parentId })
        .sort({ order: 1, name: 1 });
      
      const childrenWithSubcategories = await Promise.all(
        children.map(async (child) => {
          const subcategories = await getChildren(child._id);
          return {
            ...child.toObject(),
            subcategories
          };
        })
      );
      
      return childrenWithSubcategories;
    };

    // Build complete tree
    const categoryTree = await Promise.all(
      rootCategories.map(async (root) => {
        const subcategories = await getChildren(root._id);
        return {
          ...root.toObject(),
          subcategories
        };
      })
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
