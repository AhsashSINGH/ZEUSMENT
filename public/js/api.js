/**
 * API Module - Handles all API communications with the backend
 */

class API {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : 'http://localhost:5000/api';
    this.token = localStorage.getItem('token') || null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== Products API =====

  /**
   * Get all products with filtering and pagination
   */
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  /**
   * Get product by ID
   */
  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 12) {
    return this.get('/products/featured/list', { limit });
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit = 12) {
    return this.get('/products/trending/list', { limit });
  }

  /**
   * Get related products
   */
  async getRelatedProducts(id, limit = 8) {
    return this.get(`/products/${id}/related`, { limit });
  }

  /**
   * Search products
   */
  async searchProducts(query, limit = 10) {
    return this.get('/products/search/query', { q: query, limit });
  }

  /**
   * Get product suggestions for autocomplete
   */
  async getProductSuggestions(query, limit = 5) {
    return this.get('/products/search/suggestions', { q: query, limit });
  }

  /**
   * Add review to product
   */
  async addProductReview(productId, reviewData) {
    return this.post(`/products/${productId}/reviews`, reviewData);
  }

  // ===== Categories API =====

  /**
   * Get all categories
   */
  async getCategories(params = {}) {
    return this.get('/categories', params);
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree() {
    return this.get('/categories/tree');
  }

  /**
   * Get top-level categories
   */
  async getTopLevelCategories() {
    return this.get('/categories/top-level');
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    return this.get(`/categories/slug/${slug}`);
  }

  /**
   * Get subcategories of a category
   */
  async getSubcategories(categoryId) {
    return this.get(`/categories/${categoryId}/subcategories`);
  }

  // ===== Authentication API =====

  /**
   * Register new user
   */
  async register(userData) {
    const response = await this.post('/users/register', userData);
    this.setToken(response.data.token);
    return response;
  }

  /**
   * Login user
   */
  async login(credentials) {
    const response = await this.post('/users/login', credentials);
    this.setToken(response.data.token);
    return response;
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.get('/users/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    return this.put('/users/profile', userData);
  }

  /**
   * Logout user
   */
  logout() {
    this.setToken(null);
    window.location.href = 'login.html';
  }

  // ===== Cart API =====

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity, price) {
    return this.post('/users/cart', { productId, quantity, price });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId) {
    return this.delete(`/users/cart/${productId}`);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId, quantity) {
    return this.put(`/users/cart/${productId}`, { quantity });
  }

  /**
   * Get user cart
   */
  async getCart() {
    return this.get('/users/cart');
  }

  /**
   * Clear cart
   */
  async clearCart() {
    return this.delete('/users/cart');
  }

  // ===== Wishlist API =====

  /**
   * Add item to wishlist
   */
  async addToWishlist(productId) {
    return this.post('/users/wishlist', { productId });
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(productId) {
    return this.delete(`/users/wishlist/${productId}`);
  }

  /**
   * Get user wishlist
   */
  async getWishlist() {
    return this.get('/users/wishlist');
  }

  // ===== Orders API =====

  /**
   * Create new order
   */
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  /**
   * Get user orders
   */
  async getOrders(params = {}) {
    return this.get('/orders', params);
  }

  /**
   * Get order by ID
   */
  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(id, reason) {
    return this.put(`/orders/${id}/cancel`, { reason });
  }

  /**
   * Track order
   */
  async trackOrder(id) {
    return this.get(`/orders/${id}/track`);
  }

  // ===== Utility Methods =====

  /**
   * Handle API errors
   */
  handleError(error, customMessage = '') {
    console.error('API Error:', error);
    
    let message = customMessage || 'Something went wrong. Please try again.';
    
    if (error.message) {
      message = error.message;
    }
    
    // Show toast notification
    if (window.utils) {
      window.utils.showToast(message, 'error');
    }
    
    return message;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get current user info from token
   */
  getCurrentUser() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Invalid token:', error);
      this.setToken(null);
      return null;
    }
  }
}

// Create global API instance
window.api = new API();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
