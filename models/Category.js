const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  productCount: {
    type: Number,
    default: 0
  },
  metadata: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

// Update the updatedAt field before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug from name if not provided
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  next();
});

// Static method to get top-level categories
categorySchema.statics.getTopLevel = function() {
  return this.find({ parent: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getTree = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('parent', 'name slug');
};

// Static method to update product counts
categorySchema.statics.updateProductCounts = async function() {
  const Product = mongoose.model('Product');
  
  const categories = await this.find({ isActive: true });
  
  for (const category of categories) {
    const count = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });
    category.productCount = count;
    await category.save();
  }
};

module.exports = mongoose.model('Category', categorySchema);
