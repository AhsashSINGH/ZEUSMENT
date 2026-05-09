const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = 'createdAt',
      order = 'desc',
      search,
      badges,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (badges) {
      const badgeArray = badges.split(',');
      query.badges = { $in: badgeArray };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['price', 'rating.average', 'sales', 'views', 'createdAt', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          category,
          subcategory,
          brand,
          minPrice,
          maxPrice,
          rating,
          sort,
          order,
          search,
          badges,
          inStock
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const products = await Product.getFeatured(parseInt(limit));

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Get trending products
router.get('/trending/list', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const products = await Product.getTrending(parseInt(limit));

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { subcategory: product.subcategory }
      ],
      isActive: true
    })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .lean();

    res.json({
      success: true,
      data: relatedProducts
    });

  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
});

// Add review to product
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    if (!rating || !comment || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Rating, comment, and user ID are required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: userId,
      rating: parseInt(rating),
      comment
    });

    // Update rating
    await product.updateRating();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: product
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// Search products
router.get('/search/query', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .lean();

    res.json({
      success: true,
      data: products,
      query: q
    });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

// Get product suggestions (autocomplete)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await Product.find({
      name: new RegExp(q, 'i'),
      isActive: true
    })
    .select('name')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: suggestions.map(p => p.name)
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

module.exports = router;
