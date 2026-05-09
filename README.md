# Zeusnent - Premium E-Commerce Platform

A modern, premium e-commerce platform built with Node.js, Express, MongoDB, and vanilla JavaScript featuring a responsive design, advanced UI/UX, and comprehensive shopping functionality.

## 🚀 Features

### Frontend Features
- **Modern UI/UX Design**: Clean, premium interface with smooth animations
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Advanced Search**: Live search with autocomplete and filtering
- **Product Filtering**: Category, price range, rating, and badge filters
- **Shopping Cart**: Real-time cart updates with animations
- **Wishlist**: Save favorite products
- **User Authentication**: Login, register, profile management
- **Product Pages**: Detailed product views with image galleries
- **Order Management**: View order history and track orders
- **Loading States**: Skeleton screens and smooth transitions
- **Toast Notifications**: Non-intrusive feedback system
- **Accessibility**: WCAG compliant with keyboard navigation

### Backend Features
- **RESTful API**: Comprehensive API endpoints
- **Authentication**: JWT-based authentication with secure password hashing
- **Database**: MongoDB with Mongoose ODM
- **Product Management**: Advanced product schema with reviews and ratings
- **Order Processing**: Complete order workflow with status tracking
- **User Management**: Profiles, addresses, preferences
- **Cart & Wishlist**: Persistent cart and wishlist functionality
- **Search & Filtering**: Advanced product search capabilities
- **Security**: Rate limiting, CORS, helmet for security headers
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties, Grid, and Flexbox
- **JavaScript ES6+**: Modular JavaScript with classes and async/await
- **Font Awesome**: Icon library
- **Google Fonts**: Inter and Space Grotesk typography

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting

## 📁 Project Structure

```
zeusnent/
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── orders.js
│   │   └── categories.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── utils.js
│   │   └── main.js
│   ├── index.html
│   ├── products.html
│   ├── cart.html
│   ├── login.html
│   └── [other pages]
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zeusnent
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Start the development server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

## 📱 Pages & Features

### Main Pages
- **Home**: Hero slider, featured products, categories, trending items
- **Products**: Product listing with filters, sorting, and pagination
- **Product Detail**: Individual product pages with reviews and recommendations
- **Cart**: Shopping cart with quantity management
- **Checkout**: Multi-step checkout process
- **Login/Register**: User authentication
- **Profile**: User account management
- **Orders**: Order history and tracking

### Key Components
- **Navigation**: Sticky navbar with search and cart
- **Product Cards**: Hover effects, quick view, add to cart
- **Search**: Live search with suggestions
- **Filters**: Dynamic filtering system
- **Modals**: Quick view and confirmation dialogs
- **Notifications**: Toast system for user feedback

## 🎨 Design System

### Color Palette (Light Theme)
- **Primary**: #2563eb (Blue)
- **Secondary**: #10b981 (Green)
- **Accent**: #f59e0b (Amber)
- **Neutral**: #f9fafb to #111827 (Gray scale)

### Typography
- **Primary Font**: Inter (Clean, modern sans-serif)
- **Display Font**: Space Grotesk (Bold, distinctive headers)

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1199px
- Large Desktop: 1200px+

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/zeusnent
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

### API Endpoints

#### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured/list` - Get featured products
- `GET /api/products/trending/list` - Get trending products

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

#### Cart
- `POST /api/users/cart` - Add to cart
- `GET /api/users/cart` - Get cart
- `PUT /api/users/cart/:id` - Update cart item
- `DELETE /api/users/cart/:id` - Remove from cart

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Test Coverage
- API endpoints
- Authentication flows
- Cart functionality
- Product management

## 🚀 Deployment

### Production Build
1. Set environment variables for production
2. Build frontend assets (if using build tools)
3. Start production server

### Docker Deployment
```bash
# Build Docker image
docker build -t zeusnent .

# Run container
docker run -p 5000:5000 zeusnent
```

### Environment Setup
- **Development**: Local MongoDB, nodemon for hot reload
- **Staging**: Cloud MongoDB, basic optimizations
- **Production**: MongoDB Atlas, full optimizations, monitoring

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Images and components
- **Code Splitting**: Modular JavaScript
- **Caching**: Browser and API caching
- **Compression**: Gzip compression
- **Minification**: CSS and JavaScript minification

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request limiting
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation
- **SQL Injection Prevention**: NoSQL injection protection

### Best Practices
- Regular security updates
- Environment variable protection
- HTTPS enforcement in production
- Secure cookie handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@zeusnent.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🗺️ Roadmap

### Upcoming Features
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Mobile apps (React Native)
- [ ] AI-powered recommendations
- [ ] Advanced inventory management
- [ ] Multi-vendor marketplace
- [ ] Subscription services
- [ ] Live chat support

### Enhancements
- [ ] Performance optimizations
- [ ] Additional payment methods
- [ ] Enhanced search algorithms
- [ ] Social media integration
- [ ] Email marketing automation
- [ ] Advanced reporting

---

**Built with ❤️ by the Zeusnent Team**
