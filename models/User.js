const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    promotions: {
      type: Boolean,
      default: true
    },
    newProducts: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  membershipTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
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
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for cart total
userSchema.virtual('cartTotal').get(function() {
  return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for cart item count
userSchema.virtual('cartItemCount').get(function() {
  return this.cart.reduce((count, item) => count + item.quantity, 0);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add item to cart
userSchema.methods.addToCart = function(productId, quantity, price) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({
      product: productId,
      quantity,
      price
    });
  }
  
  return this.save();
};

// Method to remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Method to update cart item quantity
userSchema.methods.updateCartItem = function(productId, quantity) {
  const item = this.cart.find(item => item.product.toString() === productId.toString());
  
  if (item) {
    if (quantity <= 0) {
      this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
    } else {
      item.quantity = quantity;
    }
  }
  
  return this.save();
};

// Method to clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Method to add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  const exists = this.wishlist.some(item => item.product.toString() === productId.toString());
  
  if (!exists) {
    this.wishlist.push({ product: productId });
  }
  
  return this.save();
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Static method to get user statistics
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
