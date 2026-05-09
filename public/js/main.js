/**
 * Main JavaScript File - Initializes and coordinates all modules
 */

class ZeusnentApp {
  constructor() {
    this.isInitialized = false;
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Zeusnent App...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.startApp());
      } else {
        await this.startApp();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  /**
   * Start the application
   */
  async startApp() {
    try {
      console.log('📱 Starting Zeusnent App...');
      
      // Initialize modules in order
      await this.initializeModules();
      
      // Setup page-specific functionality
      this.setupPageSpecific();
      
      // Setup global event listeners
      this.setupGlobalEvents();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ Zeusnent App initialized successfully!');
      
      // Hide loading screen if still visible
      this.hideLoadingScreen();
      
    } catch (error) {
      console.error('Failed to start app:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Initialize all modules
   */
  async initializeModules() {
    console.log('🔧 Initializing modules...');
    
    // Utils are initialized automatically via constructor
    // Auth is initialized automatically via constructor
    // Cart is initialized automatically via constructor
    
    // Wait for auth to complete if user is logged in
    if (window.auth.isAuthenticated) {
      console.log('👤 User authenticated, loading profile...');
      await window.auth.loadUserProfile();
    }
    
    console.log('✅ All modules initialized');
  }

  /**
   * Setup page-specific functionality
   */
  setupPageSpecific() {
    console.log(`📄 Setting up ${this.currentPage} page...`);
    
    switch (this.currentPage) {
      case 'home':
        this.setupHomePage();
        break;
      case 'products':
        this.setupProductsPage();
        break;
      case 'product':
        this.setupProductPage();
        break;
      case 'cart':
        this.setupCartPage();
        break;
      case 'checkout':
        this.setupCheckoutPage();
        break;
      case 'profile':
        this.setupProfilePage();
        break;
      case 'orders':
        this.setupOrdersPage();
        break;
      case 'login':
        this.setupLoginPage();
        break;
      case 'register':
        this.setupRegisterPage();
        break;
      default:
        console.log('📄 No specific setup for this page');
    }
  }

  /**
   * Setup home page
   */
  async setupHomePage() {
    try {
      // Load featured products
      await this.loadFeaturedProducts();
      
      // Load trending products
      await this.loadTrendingProducts();
      
      // Load categories
      await this.loadCategories();
      
      // Setup hero slider
      this.setupHeroSlider();
      
      // Setup newsletter form
      this.setupNewsletterForm();
      
    } catch (error) {
      console.error('Failed to setup home page:', error);
    }
  }

  /**
   * Setup products page
   */
  async setupProductsPage() {
    try {
      // Load products with filters
      await this.loadProducts();
      
      // Setup filters
      this.setupProductFilters();
      
      // Setup sorting
      this.setupProductSorting();
      
      // Setup pagination
      this.setupProductPagination();
      
    } catch (error) {
      console.error('Failed to setup products page:', error);
    }
  }

  /**
   * Setup product detail page
   */
  async setupProductPage() {
    try {
      const productId = this.getUrlParam('id');
      if (!productId) {
        window.location.href = 'products.html';
        return;
      }
      
      // Load product details
      await this.loadProductDetails(productId);
      
      // Setup product gallery
      this.setupProductGallery();
      
      // Setup quantity selector
      this.setupQuantitySelector();
      
      // Setup product tabs
      this.setupProductTabs();
      
      // Load related products
      await this.loadRelatedProducts(productId);
      
    } catch (error) {
      console.error('Failed to setup product page:', error);
    }
  }

  /**
   * Setup cart page
   */
  setupCartPage() {
    // Cart functionality is handled by cart module
    console.log('🛒 Cart page setup complete');
  }

  /**
   * Setup checkout page
   */
  setupCheckoutPage() {
    if (!window.auth.isAuthenticated) {
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }
    
    this.setupCheckoutForm();
    this.setupPaymentMethods();
  }

  /**
   * Setup profile page
   */
  setupProfilePage() {
    if (!window.auth.isAuthenticated) {
      window.location.href = 'login.html?redirect=profile.html';
      return;
    }
    
    this.setupProfileForm();
    this.setupAddressManagement();
  }

  /**
   * Setup orders page
   */
  async setupOrdersPage() {
    if (!window.auth.isAuthenticated) {
      window.location.href = 'login.html?redirect=orders.html';
      return;
    }
    
    await this.loadUserOrders();
  }

  /**
   * Setup login page
   */
  setupLoginPage() {
    if (window.auth.isAuthenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    // Login form is handled by auth module
  }

  /**
   * Setup register page
   */
  setupRegisterPage() {
    if (window.auth.isAuthenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    // Register form is handled by auth module
  }

  /**
   * Load featured products
   */
  async loadFeaturedProducts() {
    try {
      const response = await window.api.getFeaturedProducts(8);
      this.renderProducts(response.data, 'featured-products-grid');
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  }

  /**
   * Load trending products
   */
  async loadTrendingProducts() {
    try {
      const response = await window.api.getTrendingProducts(10);
      this.renderCarouselProducts(response.data, 'trending-carousel');
    } catch (error) {
      console.error('Failed to load trending products:', error);
    }
  }

  /**
   * Load categories
   */
  async loadCategories() {
    try {
      const response = await window.api.getTopLevelCategories();
      this.renderCategories(response.data);
      this.renderFooterCategories(response.data);
      this.renderNavigationCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  /**
   * Load products
   */
  async loadProducts() {
    try {
      const params = this.getUrlParams();
      const response = await window.api.getProducts(params);
      this.renderProducts(response.data.products, 'products-grid');
      this.renderPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  /**
   * Load product details
   */
  async loadProductDetails(productId) {
    try {
      const response = await window.api.getProduct(productId);
      this.renderProductDetails(response.data);
      document.title = `${response.data.name} - Zeusnent`;
    } catch (error) {
      console.error('Failed to load product details:', error);
      window.location.href = 'products.html';
    }
  }

  /**
   * Load related products
   */
  async loadRelatedProducts(productId) {
    try {
      const response = await window.api.getRelatedProducts(productId, 4);
      this.renderProducts(response.data, 'related-products-grid');
    } catch (error) {
      console.error('Failed to load related products:', error);
    }
  }

  /**
   * Load user orders
   */
  async loadUserOrders() {
    try {
      const response = await window.api.getOrders();
      this.renderOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  /**
   * Render products grid
   */
  renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <i class="fas fa-box-open"></i>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => this.createProductCard(product)).join('');
  }

  /**
   * Render products carousel
   */
  renderCarouselProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const carouselHTML = `
      <div class="carousel-container">
        ${products.map(product => this.createProductCard(product)).join('')}
      </div>
      <div class="carousel-controls">
        <button class="carousel-control prev" id="trending-prev">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-control next" id="trending-next">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    container.innerHTML = carouselHTML;
    this.setupCarousel('trending-carousel');
  }

  /**
   * Render categories
   */
  renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    container.innerHTML = categories.map(category => `
      <div class="category-card" data-category="${category.slug}">
        <div class="category-image">
          <img src="${category.image}" alt="${category.name}">
          <div class="category-overlay">
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.productCount || 0} Products</p>
          </div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        window.location.href = `products.html?category=${category}`;
      });
    });
  }

  /**
   * Render footer categories
   */
  renderFooterCategories(categories) {
    const container = document.getElementById('footer-categories');
    if (!container) return;

    container.innerHTML = categories.slice(0, 5).map(category => `
      <li><a href="products.html?category=${category.slug}">${category.name}</a></li>
    `).join('');
  }

  /**
   * Render navigation categories
   */
  renderNavigationCategories(categories) {
    const container = document.getElementById('categories-menu');
    if (!container) return;

    container.innerHTML = categories.map(category => `
      <li>
        <a href="products.html?category=${category.slug}">${category.name}</a>
      </li>
    `).join('');
  }

  /**
   * Create product card HTML
   */
  createProductCard(product) {
    const badges = product.badges || [];
    const discount = product.discountPercentage || 0;
    
    return `
      <div class="product-card" data-product-id="${product._id}">
        ${badges.length > 0 ? `
          <div class="product-badges">
            ${badges.map(badge => `
              <span class="badge badge-${badge}">${badge}</span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="product-image">
          <img src="${product.thumbnail}" alt="${product.name}">
          <div class="product-actions">
            <button class="product-action-btn quick-view" data-product-id="${product._id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="product-action-btn wishlist" data-product-id="${product._id}">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        
        <div class="product-details">
          <p class="product-category">${product.category?.name || 'Uncategorized'}</p>
          <h3 class="product-name">${product.name}</h3>
          
          <div class="product-rating">
            <div class="stars">
              ${this.renderStars(product.rating?.average || 0)}
            </div>
            <span class="rating-count">(${product.rating?.count || 0})</span>
          </div>
          
          <div class="product-price">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice && product.originalPrice > product.price ? `
              <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
              ${discount > 0 ? `<span class="discount-percentage">-${discount}%</span>` : ''}
            ` : ''}
          </div>
          
          <button class="add-to-cart-btn" 
                  data-product-id="${product._id}" 
                  data-price="${product.price}"
                  data-product-name="${product.name}"
                  data-product-image="${product.thumbnail}">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render star rating
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star star filled"></i>';
    }
    
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt star filled"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star star"></i>';
    }
    
    return stars;
  }

  /**
   * Setup hero slider
   */
  setupHeroSlider() {
    const slider = document.getElementById('hero-slider');
    const slides = slider?.querySelectorAll('.hero-slide');
    const indicators = document.getElementById('hero-indicators');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    
    if (!slides || slides.length === 0) return;
    
    let currentSlide = 0;
    
    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      if (indicators) {
        indicators.querySelectorAll('.indicator').forEach((indicator, i) => {
          indicator.classList.toggle('active', i === index);
        });
      }
      
      currentSlide = index;
    };
    
    const nextSlide = () => {
      showSlide((currentSlide + 1) % slides.length);
    };
    
    const prevSlide = () => {
      showSlide((currentSlide - 1 + slides.length) % slides.length);
    };
    
    // Auto-play
    const autoPlay = setInterval(nextSlide, 5000);
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => {
      prevSlide();
      clearInterval(autoPlay);
    });
    
    if (nextBtn) nextBtn.addEventListener('click', () => {
      nextSlide();
      clearInterval(autoPlay);
    });
    
    if (indicators) {
      indicators.querySelectorAll('.indicator').forEach((indicator, i) => {
        indicator.addEventListener('click', () => {
          showSlide(i);
          clearInterval(autoPlay);
        });
      });
    }
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
    slider.addEventListener('mouseleave', () => {
      setInterval(nextSlide, 5000);
    });
  }

  /**
   * Setup carousel
   */
  setupCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    const container = carousel?.querySelector('.carousel-container');
    const prevBtn = document.getElementById(`${carouselId}-prev`);
    const nextBtn = document.getElementById(`${carouselId}-next`);
    
    if (!container) return;
    
    const scrollAmount = 300;
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  }

  /**
   * Setup newsletter form
   */
  setupNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      
      // Here you would normally subscribe to newsletter
      window.utils.showToast('Successfully subscribed to newsletter!', 'success');
      form.reset();
    });
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEvents() {
    // Handle online/offline status
    window.addEventListener('online', () => {
      window.utils.showToast('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
      window.utils.showToast('Connection lost', 'warning');
    });
    
    // Handle cart updates
    window.addEventListener('cartUpdated', (e) => {
      console.log('Cart updated:', e.detail);
    });
    
    // Handle user authentication
    window.addEventListener('userLoggedIn', (e) => {
      console.log('User logged in:', e.detail.user);
    });
    
    window.addEventListener('userLoggedOut', () => {
      console.log('User logged out');
    });
  }

  /**
   * Get current page type
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename === 'index.html' || filename === '') return 'home';
    if (filename.startsWith('product')) return 'product';
    if (filename.startsWith('products')) return 'products';
    if (filename === 'cart.html') return 'cart';
    if (filename === 'checkout.html') return 'checkout';
    if (filename === 'profile.html') return 'profile';
    if (filename === 'orders.html') return 'orders';
    if (filename === 'login.html') return 'login';
    if (filename === 'register.html') return 'register';
    
    return 'other';
  }

  /**
   * Get URL parameter
   */
  getUrlParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  /**
   * Get all URL parameters
   */
  getUrlParams() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-screen';
    errorDiv.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Oops! Something went wrong</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ZeusnentApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZeusnentApp;
}
