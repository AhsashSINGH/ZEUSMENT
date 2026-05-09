const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { uploadMultiple, getFileUrls, deleteFiles } = require('../multerConfig');

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      brand,
      badges,
      inStock,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Badges filter
    if (badges) {
      const badgeArray = Array.isArray(badges) ? badges : [badges];
      query.badges = { $in: badgeArray };
    }

    // Stock filter
    if (inStock !== undefined) {
      query.stock = inStock === 'true' ? { $gt: 0 } : { $lte: 0 };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug')
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Format response
    const formattedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
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
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add discount percentage
    product.discountPercentage = product.originalPrice ? 
      Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product with image upload
router.post('/', auth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      brand,
      sku,
      stock,
      specifications,
      tags,
      badges,
      sizes,
      colors
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Handle images
    const images = req.files ? getFileUrls(req.files, 'products') : [];
    const thumbnail = images.length > 0 ? images[0] : null;

    // Create product
    const product = new Product({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      brand,
      sku,
      stock: parseInt(stock) || 0,
      images,
      thumbnail,
      specifications: specifications ? JSON.parse(specifications) : {},
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      badges: badges ? (Array.isArray(badges) ? badges : badges.split(',')) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      rating: { average: 0, count: 0 }
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      deleteFiles(req.files.map(file => `/images/products/${file.filename}`));
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product with image upload
router.put('/:id', auth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      brand,
      sku,
      stock,
      specifications,
      tags,
      badges,
      sizes,
      colors,
      deleteImages
    } = req.body;

    // Handle image deletion
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      deleteFiles(imagesToDelete);
      product.images = product.images.filter(img => !imagesToDelete.includes(img));
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = getFileUrls(req.files, 'products');
      product.images.push(...newImages);
      
      // Update thumbnail if no thumbnail exists
      if (!product.thumbnail && newImages.length > 0) {
        product.thumbnail = newImages[0];
      }
    }

    // Update fields
    if (name) product.name = name;
    if (slug) product.slug = slug;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = parseFloat(originalPrice);
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (sku) product.sku = sku;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (specifications) product.specifications = JSON.parse(specifications);
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (badges) product.badges = Array.isArray(badges) ? badges : badges.split(',');
    if (sizes) product.sizes = JSON.parse(sizes);
    if (colors) product.colors = JSON.parse(colors);

    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      deleteFiles(product.images);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ badges: 'featured' })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Get trending products
router.get('/trending/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ badges: 'trending' })
      .limit(parseInt(limit))
      .sort({ 'rating.count': -1, 'rating.average': -1 })
      .lean();

    const formattedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
});

// Get product suggestions for search
router.get('/suggestions/list', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    })
      .select('name thumbnail price category')
      .limit(parseInt(limit))
      .populate('category', 'name')
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
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
        { tags: { $in: product.tags } }
      ]
    })
      .limit(parseInt(limit))
      .lean();

    const formattedProducts = relatedProducts.map(product => ({
      ...product,
      discountPercentage: product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
});

// Search products
router.get('/search/query', async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .lean();

    const formattedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

module.exports = router;
