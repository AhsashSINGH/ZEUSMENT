/**
 * Database Seeding Script - Populate database with realistic sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');
const Category = require('./models/Category');
const Order = require('./models/Order');

// Sample data
const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://picsum.photos/seed/electronics/400/300',
    parentCategory: null
  },
  {
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    description: 'Laptops, desktops, and computer accessories',
    image: 'https://picsum.photos/seed/computers/400/300',
    parentCategory: 'electronics'
  },
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Latest smartphones and mobile accessories',
    image: 'https://picsum.photos/seed/smartphones/400/300',
    parentCategory: 'electronics'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, and accessories',
    image: 'https://picsum.photos/seed/fashion/400/300',
    parentCategory: null
  },
  {
    name: "Men's Clothing",
    slug: 'mens-clothing',
    description: 'Fashionable clothing for men',
    image: 'https://picsum.photos/seed/mens-fashion/400/300',
    parentCategory: 'fashion'
  },
  {
    name: "Women's Clothing",
    slug: 'womens-clothing',
    description: 'Fashionable clothing for women',
    image: 'https://picsum.photos/seed/womens-fashion/400/300',
    parentCategory: 'fashion'
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, and garden supplies',
    image: 'https://picsum.photos/seed/home-garden/400/300',
    parentCategory: null
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Modern and classic furniture pieces',
    image: 'https://picsum.photos/seed/furniture/400/300',
    parentCategory: 'home-garden'
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://picsum.photos/seed/sports/400/300',
    parentCategory: null
  }
];

const products = [
  // Electronics
  {
    name: 'MacBook Pro 14"',
    slug: 'macbook-pro-14',
    description: 'Powerful laptop with M2 Pro chip, perfect for professionals and creators.',
    price: 1999.99,
    originalPrice: 2199.99,
    category: 'computers-laptops',
    brand: 'Apple',
    sku: 'MBP14-M2-2023',
    stock: 25,
    images: [
      'https://picsum.photos/seed/macbook-pro-14-1/800/800',
      'https://picsum.photos/seed/macbook-pro-14-2/800/800',
      'https://picsum.photos/seed/macbook-pro-14-3/800/800',
      'https://picsum.photos/seed/macbook-pro-14-4/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/macbook-pro-14-thumb/300/300',
    badges: ['new', 'featured'],
    specifications: {
      'Processor': 'Apple M2 Pro',
      'RAM': '16GB',
      'Storage': '512GB SSD',
      'Display': '14.2" Liquid Retina XDR',
      'Battery': 'Up to 18 hours'
    },
    tags: ['laptop', 'apple', 'professional', 'm2'],
    rating: { average: 4.8, count: 156 }
  },
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'The most advanced iPhone yet with titanium design and A17 Pro chip.',
    price: 999.99,
    originalPrice: 1099.99,
    category: 'smartphones',
    brand: 'Apple',
    sku: 'IP15P-128-2023',
    stock: 50,
    images: [
      'https://picsum.photos/seed/iphone-15-pro-1/800/800',
      'https://picsum.photos/seed/iphone-15-pro-2/800/800',
      'https://picsum.photos/seed/iphone-15-pro-3/800/800',
      'https://picsum.photos/seed/iphone-15-pro-4/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/iphone-15-pro-thumb/300/300',
    badges: ['new', 'trending'],
    specifications: {
      'Display': '6.1" Super Retina XDR',
      'Processor': 'A17 Pro',
      'Storage': '128GB',
      'Camera': '48MP Main',
      'Battery': 'Up to 23 hours video playback'
    },
    tags: ['smartphone', 'apple', 'premium', '5g'],
    rating: { average: 4.9, count: 342 }
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Ultimate Android smartphone with S Pen and advanced camera system.',
    price: 1199.99,
    category: 'smartphones',
    brand: 'Samsung',
    sku: 'SGS24U-256-2024',
    stock: 30,
    images: [
      'https://picsum.photos/seed/galaxy-s24-ultra-1/800/800',
      'https://picsum.photos/seed/galaxy-s24-ultra-2/800/800',
      'https://picsum.photos/seed/galaxy-s24-ultra-3/800/800',
      'https://picsum.photos/seed/galaxy-s24-ultra-4/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/galaxy-s24-ultra-thumb/300/300',
    badges: ['new', 'featured'],
    specifications: {
      'Display': '6.8" Dynamic AMOLED 2X',
      'Processor': 'Snapdragon 8 Gen 3',
      'Storage': '256GB',
      'Camera': '200MP Main',
      'Battery': '5000mAh',
      'S Pen': 'Included'
    },
    tags: ['smartphone', 'samsung', 'android', 'premium'],
    rating: { average: 4.7, count: 89 }
  },
  {
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    description: 'High-performance laptop with stunning 4K display and powerful specs.',
    price: 1799.99,
    category: 'computers-laptops',
    brand: 'Dell',
    sku: 'DXPS15-I7-2023',
    stock: 15,
    images: [
      'https://picsum.photos/seed/dell-xps-15-1/800/800',
      'https://picsum.photos/seed/dell-xps-15-2/800/800',
      'https://picsum.photos/seed/dell-xps-15-3/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/dell-xps-15-thumb/300/300',
    badges: ['featured'],
    specifications: {
      'Processor': 'Intel Core i7-13700H',
      'RAM': '32GB DDR5',
      'Storage': '1TB SSD',
      'Display': '15.6" 4K OLED',
      'Graphics': 'NVIDIA RTX 4060'
    },
    tags: ['laptop', 'dell', 'gaming', '4k'],
    rating: { average: 4.6, count: 67 }
  },
  
  // Fashion
  {
    name: "Men's Premium Leather Jacket",
    slug: 'mens-leather-jacket',
    description: 'Genuine leather jacket with modern fit and premium craftsmanship.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'mens-clothing',
    brand: 'Urban Style',
    sku: 'MLJ-BLACK-L-2023',
    stock: 20,
    images: [
      'https://picsum.photos/seed/mens-jacket-1/800/800',
      'https://picsum.photos/seed/mens-jacket-2/800/800',
      'https://picsum.photos/seed/mens-jacket-3/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/mens-jacket-thumb/300/300',
    badges: ['sale'],
    sizes: [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: false },
      { name: 'XXL', inStock: true }
    ],
    colors: [
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Brown', hex: '#8B4513', inStock: true }
    ],
    specifications: {
      'Material': '100% Genuine Leather',
      'Lining': 'Polyester',
      'Care': 'Professional dry clean only',
      'Fit': 'Modern slim fit'
    },
    tags: ['jacket', 'leather', 'mens', 'premium'],
    rating: { average: 4.5, count: 234 }
  },
  {
    name: "Women's Silk Evening Dress",
    slug: 'womens-silk-dress',
    description: 'Elegant silk dress perfect for formal events and special occasions.',
    price: 189.99,
    category: 'womens-clothing',
    brand: 'Elegance',
    sku: 'WSD-RED-M-2023',
    stock: 12,
    images: [
      'https://picsum.photos/seed/womens-dress-1/800/800',
      'https://picsum.photos/seed/womens-dress-2/800/800',
      'https://picsum.photos/seed/womens-dress-3/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/womens-dress-thumb/300/300',
    badges: ['featured'],
    sizes: [
      { name: 'XS', inStock: true },
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true }
    ],
    colors: [
      { name: 'Red', hex: '#FF0000', inStock: true },
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true }
    ],
    specifications: {
      'Material': '100% Silk',
      'Length': 'Floor length',
      'Care': 'Hand wash only',
      'Fit': 'A-line'
    },
    tags: ['dress', 'silk', 'womens', 'formal'],
    rating: { average: 4.7, count: 89 }
  },
  
  // Home & Garden
  {
    name: 'Modern Sectional Sofa',
    slug: 'modern-sectional-sofa',
    description: 'Comfortable and stylish sectional sofa perfect for modern living rooms.',
    price: 899.99,
    originalPrice: 1299.99,
    category: 'furniture',
    brand: 'Comfort Living',
    sku: 'MSS-GRAY-3PC-2023',
    stock: 8,
    images: [
      'https://picsum.photos/seed/sectional-sofa-1/800/800',
      'https://picsum.photos/seed/sectional-sofa-2/800/800',
      'https://picsum.photos/seed/sectional-sofa-3/800/800',
      'https://picsum.photos/seed/sectional-sofa-4/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/sectional-sofa-thumb/300/300',
    badges: ['sale', 'trending'],
    specifications: {
      'Material': 'Fabric upholstery',
      'Dimensions': '120" x 85" x 35"',
      'Seats': '5-6 people',
      'Assembly': 'Required',
      'Care': 'Spot clean'
    },
    tags: ['sofa', 'furniture', 'living room', 'modern'],
    rating: { average: 4.4, count: 45 }
  },
  {
    name: 'Smart LED TV 65"',
    slug: 'smart-led-tv-65',
    description: '4K Smart TV with HDR support and built-in streaming apps.',
    price: 699.99,
    category: 'electronics',
    brand: 'TechVision',
    sku: 'SLTV65-4K-2023',
    stock: 18,
    images: [
      'https://picsum.photos/seed/smart-tv-1/800/800',
      'https://picsum.photos/seed/smart-tv-2/800/800',
      'https://picsum.photos/seed/smart-tv-3/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/smart-tv-thumb/300/300',
    badges: ['featured'],
    specifications: {
      'Display': '65" 4K UHD',
      'Smart TV': 'Yes',
      'HDR': 'HDR10, Dolby Vision',
      'Refresh Rate': '120Hz',
      'Ports': '4x HDMI, 2x USB'
    },
    tags: ['tv', 'smart', '4k', 'electronics'],
    rating: { average: 4.6, count: 123 }
  },
  
  // Sports & Outdoors
  {
    name: 'Professional Mountain Bike',
    slug: 'mountain-bike-pro',
    description: 'High-performance mountain bike for serious trail riders.',
    price: 1299.99,
    category: 'sports-outdoors',
    brand: 'TrailBlazer',
    sku: 'TMB-PRO-27-2023',
    stock: 10,
    images: [
      'https://picsum.photos/seed/mountain-bike-1/800/800',
      'https://picsum.photos/seed/mountain-bike-2/800/800',
      'https://picsum.photos/seed/mountain-bike-3/800/800',
      'https://picsum.photos/seed/mountain-bike-4/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/mountain-bike-thumb/300/300',
    badges: ['new'],
    specifications: {
      'Frame': 'Aluminum alloy',
      'Gears': '27-speed',
      'Brakes': 'Hydraulic disc',
      'Suspension': 'Front suspension',
      'Wheel Size': '27.5"'
    },
    tags: ['bike', 'mountain', 'sports', 'outdoor'],
    rating: { average: 4.8, count: 56 }
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Extra thick, non-slip yoga mat for comfortable practice.',
    price: 49.99,
    category: 'sports-outdoors',
    brand: 'ZenFit',
    sku: 'YMP-PURPLE-6MM-2023',
    stock: 100,
    images: [
      'https://picsum.photos/seed/yoga-mat-1/800/800',
      'https://picsum.photos/seed/yoga-mat-2/800/800'
    ],
    thumbnail: 'https://picsum.photos/seed/yoga-mat-thumb/300/300',
    badges: ['sale'],
    colors: [
      { name: 'Purple', hex: '#800080', inStock: true },
      { name: 'Blue', hex: '#0000FF', inStock: true },
      { name: 'Green', hex: '#008000', inStock: true }
    ],
    specifications: {
      'Thickness': '6mm',
      'Material': 'TPE eco-friendly',
      'Dimensions': '72" x 24"',
      'Non-slip': 'Yes',
      'Carrying Strap': 'Included'
    },
    tags: ['yoga', 'fitness', 'exercise', 'mat'],
    rating: { average: 4.5, count: 178 }
  }
];

const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+1234567890',
    avatar: 'https://picsum.photos/seed/user-john/200/200'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '+1234567891',
    avatar: 'https://picsum.photos/seed/user-jane/200/200'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@zeusnent.com',
    password: 'admin123',
    phone: '+1234567892',
    role: 'admin',
    avatar: 'https://picsum.photos/seed/user-admin/200/200'
  }
];

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeusnent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Seeding functions
async function seedCategories() {
  console.log('Seeding categories...');
  
  // Clear existing categories
  await Category.deleteMany({});
  
  // Create categories
  const createdCategories = [];
  for (const categoryData of categories) {
    const category = new Category(categoryData);
    await category.save();
    createdCategories.push(category);
  }
  
  console.log(`Created ${createdCategories.length} categories`);
  return createdCategories;
}

async function seedUsers() {
  console.log('Seeding users...');
  
  // Clear existing users
  await User.deleteMany({});
  
  // Create users
  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    createdUsers.push(user);
  }
  
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedProducts() {
  console.log('Seeding products...');
  
  // Clear existing products
  await Product.deleteMany({});
  
  // Create products
  const createdProducts = [];
  for (const productData of products) {
    const product = new Product(productData);
    await product.save();
    createdProducts.push(product);
  }
  
  console.log(`Created ${createdProducts.length} products`);
  return createdProducts;
}

async function seedOrders() {
  console.log('Seeding orders...');
  
  // Get users and products
  const users = await User.find({});
  const products = await Product.find({});
  
  // Clear existing orders
  await Order.deleteMany({});
  
  // Create sample orders
  const orders = [];
  
  // Create a few sample orders
  for (let i = 0; i < 5; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const orderProducts = [];
    
    // Add 1-3 random products to each order
    const numProducts = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numProducts; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      orderProducts.push({
        product: product._id,
        quantity: quantity,
        price: product.price,
        subtotal: product.price * quantity
      });
    }
    
    const order = new Order({
      user: user._id,
      items: orderProducts,
      totalAmount: orderProducts.reduce((sum, item) => sum + item.subtotal, 0),
      status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'paid'
    });
    
    await order.save();
    orders.push(order);
  }
  
  console.log(`Created ${orders.length} orders`);
  return orders;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    await seedCategories();
    await seedUsers();
    await seedProducts();
    await seedOrders();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedCategories,
  seedUsers,
  seedProducts,
  seedOrders,
  seedDatabase
};
