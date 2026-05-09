const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://picsum.photos"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zeusnent.com'] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Image serving routes
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Zeusnent E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/logout': 'Logout user'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'GET /api/users/orders': 'Get user orders',
        'POST /api/users/cart': 'Add item to cart',
        'GET /api/users/cart': 'Get cart',
        'PUT /api/users/cart/:id': 'Update cart item',
        'DELETE /api/users/cart/:id': 'Remove cart item',
        'POST /api/users/wishlist': 'Add to wishlist',
        'GET /api/users/wishlist': 'Get wishlist',
        'DELETE /api/users/wishlist/:id': 'Remove from wishlist'
      },
      products: {
        'GET /api/products': 'Get all products with filtering',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product (auth required)',
        'PUT /api/products/:id': 'Update product (auth required)',
        'DELETE /api/products/:id': 'Delete product (auth required)',
        'GET /api/products/featured/list': 'Get featured products',
        'GET /api/products/trending/list': 'Get trending products',
        'GET /api/products/suggestions/list': 'Get product suggestions',
        'GET /api/products/:id/related': 'Get related products',
        'GET /api/products/search/query': 'Search products'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'GET /api/categories/:id': 'Get category by ID',
        'POST /api/categories': 'Create new category (auth required)',
        'PUT /api/categories/:id': 'Update category (auth required)',
        'DELETE /api/categories/:id': 'Delete category (auth required)',
        'GET /api/categories/top-level': 'Get top-level categories'
      },
      orders: {
        'GET /api/orders': 'Get user orders (auth required)',
        'GET /api/orders/:id': 'Get order by ID (auth required)',
        'POST /api/orders': 'Create new order (auth required)',
        'PUT /api/orders/:id': 'Update order status (auth required)'
      }
    }
  });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded.'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeusnent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.NODE_ENV === 'production' ? 'https://zeusnent.com' : 'http://localhost:5000'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
