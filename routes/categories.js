const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { featured, parent } = req.query;
    
    let query = { isActive: true };
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (parent === 'null' || parent === '0') {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .populate('parent', 'name slug')
      .lean();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get category tree
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.getTree();
    
    // Build tree structure
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter(cat => {
          if (parentId === null) {
            return cat.parent === null;
          }
          return cat.parent && cat.parent._id.toString() === parentId;
        })
        .map(cat => ({
          ...cat,
          children: buildTree(categories, cat._id.toString())
        }));
    };

    const tree = buildTree(categories);

    res.json({
      success: true,
      data: tree
    });

  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category tree'
    });
  }
});

// Get top-level categories
router.get('/top-level', async (req, res) => {
  try {
    const categories = await Category.getTopLevel();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get top-level categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top-level categories'
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
    .populate('parent', 'name slug')
    .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// Get subcategories
router.get('/:id/subcategories', async (req, res) => {
  try {
    const subcategories = await Category.find({ 
      parent: req.params.id, 
      isActive: true 
    })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

    res.json({
      success: true,
      data: subcategories
    });

  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories'
    });
  }
});

module.exports = router;
