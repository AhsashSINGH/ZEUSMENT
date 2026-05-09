/**
 * Authentication Module - Handles user authentication and session management
 */

class Auth {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  /**
   * Initialize authentication
   */
  async init() {
    // Check if user is already logged in
    if (window.api.isAuthenticated()) {
      try {
        await this.loadUserProfile();
        this.updateUI();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        this.logout();
      }
    }
  }

  /**
   * Load user profile from API
   */
  async loadUserProfile() {
    try {
      const response = await window.api.getProfile();
      this.currentUser = response.data;
      this.isAuthenticated = true;
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: this.currentUser } 
      }));
      
      return this.currentUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await window.api.register(userData);
      this.currentUser = response.data.user;
      this.isAuthenticated = true;
      
      // Update UI
      this.updateUI();
      
      // Show success message
      window.utils.showToast('Registration successful! Welcome to Zeusnent!', 'success');
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('userRegistered', { 
        detail: { user: this.currentUser } 
      }));
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await window.api.login(credentials);
      this.currentUser = response.data.user;
      this.isAuthenticated = true;
      
      // Update UI
      this.updateUI();
      
      // Show success message
      window.utils.showToast('Login successful! Welcome back!', 'success');
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: this.currentUser } 
      }));
      
      // Redirect if needed
      if (window.location.pathname === '/login.html' || 
          window.location.pathname === '/register.html') {
        window.location.href = 'index.html';
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    // Clear API token
    window.api.logout();
    
    // Clear local data
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Clear cart data
    if (window.cart) {
      window.cart.clearCart();
    }
    
    // Update UI
    this.updateUI();
    
    // Show message
    window.utils.showToast('You have been logged out successfully', 'info');
    
    // Emit custom event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Redirect to home if not already there
    if (!window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    try {
      const response = await window.api.updateProfile(userData);
      this.currentUser = response.data;
      
      // Update UI
      this.updateUI();
      
      // Show success message
      window.utils.showToast('Profile updated successfully!', 'success');
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { user: this.currentUser } 
      }));
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update UI based on authentication state
   */
  updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (this.isAuthenticated && this.currentUser) {
      // Show user info
      if (authButtons) authButtons.style.display = 'none';
      if (userInfo) userInfo.style.display = 'block';
      if (userName) userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      if (userEmail) userEmail.textContent = this.currentUser.email;
      
      // Update avatar if available
      if (userAvatar && this.currentUser.avatar) {
        userAvatar.src = this.currentUser.avatar;
      }
      
      // Update cart and wishlist counts
      if (cartCount && this.currentUser.cartItemCount) {
        cartCount.textContent = this.currentUser.cartItemCount;
      }
      
      if (wishlistCount && this.currentUser.wishlist) {
        wishlistCount.textContent = this.currentUser.wishlist.length;
      }
      
      // Show/hide authenticated elements
      document.querySelectorAll('.auth-required').forEach(el => {
        el.style.display = 'block';
      });
      
      document.querySelectorAll('.auth-hidden').forEach(el => {
        el.style.display = 'none';
      });
      
    } else {
      // Show login/register buttons
      if (authButtons) authButtons.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
      
      // Reset counts
      if (cartCount) cartCount.textContent = '0';
      if (wishlistCount) wishlistCount.textContent = '0';
      
      // Show/hide non-authenticated elements
      document.querySelectorAll('.auth-required').forEach(el => {
        el.style.display = 'none';
      });
      
      document.querySelectorAll('.auth-hidden').forEach(el => {
        el.style.display = 'block';
      });
    }
  }

  /**
   * Check if user has specific role or permission
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Check if user is verified
   */
  isVerified() {
    return this.currentUser && this.currentUser.isVerified;
  }

  /**
   * Get user's full name
   */
  getFullName() {
    return this.currentUser ? 
      `${this.currentUser.firstName} ${this.currentUser.lastName}` : 
      'Guest';
  }

  /**
   * Get user's membership tier
   */
  getMembershipTier() {
    return this.currentUser ? this.currentUser.membershipTier : null;
  }

  /**
   * Get user's loyalty points
   */
  getLoyaltyPoints() {
    return this.currentUser ? this.currentUser.loyaltyPoints : 0;
  }

  /**
   * Setup authentication event listeners
   */
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(loginForm);
      });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister(registerForm);
      });
    }

    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleProfileUpdate(profileForm);
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // User menu toggle
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
      });

      userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin(form) {
    const formData = new FormData(form);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      await this.login(credentials);
      form.reset();
    } catch (error) {
      window.utils.showToast(window.api.handleError(error, 'Login failed'), 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle register form submission
   */
  async handleRegister(form) {
    const formData = new FormData(form);
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone')
    };

    // Validate passwords match
    if (userData.password !== formData.get('confirmPassword')) {
      window.utils.showToast('Passwords do not match', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
      await this.register(userData);
      form.reset();
    } catch (error) {
      window.utils.showToast(window.api.handleError(error, 'Registration failed'), 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle profile update form submission
   */
  async handleProfileUpdate(form) {
    const formData = new FormData(form);
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender')
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    try {
      await this.updateProfile(userData);
    } catch (error) {
      window.utils.showToast(window.api.handleError(error, 'Profile update failed'), 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Protect routes that require authentication
   */
  protectRoute() {
    const protectedRoutes = ['/profile.html', '/orders.html', '/cart.html', '/checkout.html'];
    const currentPath = window.location.pathname;
    
    if (protectedRoutes.some(route => currentPath.includes(route)) && !this.isAuthenticated) {
      window.location.href = 'login.html';
      return false;
    }
    
    return true;
  }

  /**
   * Get authentication state
   */
  getState() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser
    };
  }
}

// Create global auth instance
window.auth = new Auth();

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.auth.setupEventListeners();
  window.auth.protectRoute();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
