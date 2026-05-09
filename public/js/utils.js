/**
 * Utilities Module - Common utility functions and helpers
 */

class Utils {
  constructor() {
    this.init();
  }

  /**
   * Initialize utilities
   */
  init() {
    this.setupThemeToggle();
    this.setupSmoothScrolling();
    this.setupLoadingScreen();
    this.setupFormValidation();
    this.setupImageLazyLoading();
  }

  /**
   * Theme management
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (themeIcon) {
          themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Show toast
        this.showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
      });
    }

    // Set initial icon
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (themeIcon) {
      themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  /**
   * Smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Loading screen management
   */
  setupLoadingScreen() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
          setTimeout(() => {
            loadingScreen.style.display = 'none';
          }, 500);
        }
      }, 1000);
    });
  }

  /**
   * Form validation
   */
  setupFormValidation() {
    // Email validation
    window.validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    // Phone validation
    window.validatePhone = (phone) => {
      const re = /^[\d\s\-\+\(\)]+$/;
      return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    };

    // Password validation
    window.validatePassword = (password) => {
      return password.length >= 6;
    };

    // Add validation to forms
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Validate form
   */
  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
      const value = input.value.trim();
      let fieldValid = true;
      
      // Check if empty
      if (!value) {
        fieldValid = false;
      }
      
      // Email validation
      if (input.type === 'email' && value) {
        fieldValid = window.validateEmail(value);
      }
      
      // Phone validation
      if (input.type === 'tel' && value) {
        fieldValid = window.validatePhone(value);
      }
      
      // Password validation
      if (input.type === 'password' && value) {
        fieldValid = window.validatePassword(value);
      }
      
      // Show/hide error
      const errorElement = input.parentElement.querySelector('.error-message');
      if (!fieldValid) {
        input.classList.add('error');
        if (errorElement) {
          errorElement.style.display = 'block';
        }
        isValid = false;
      } else {
        input.classList.remove('error');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }
    });
    
    return isValid;
  }

  /**
   * Image lazy loading
   */
  setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Toast notifications
   */
  showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fas fa-check',
      error: 'fas fa-exclamation',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info'
    };

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icons[type] || icons.info}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide toast
    const hideToast = () => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    };

    // Auto hide
    setTimeout(hideToast, duration);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', hideToast);
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Generate slug from string
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Truncate text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  /**
   * Get URL parameters
   */
  getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    return params;
  }

  /**
   * Update URL parameters
   */
  updateUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url);
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy:', err);
      this.showToast('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Download file
   */
  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Animate elements on scroll
   */
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Setup sticky header
   */
  setupStickyHeader() {
    const header = document.getElementById('header');
    const navbar = document.getElementById('navbar');
    
    if (header && navbar) {
      const handleScroll = this.throttle(() => {
        if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, 100);

      window.addEventListener('scroll', handleScroll);
    }
  }

  /**
   * Setup mobile menu
   */
  setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          mobileMenuToggle.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          mobileMenuToggle.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchResults) {
      let searchTimeout;
      
      const performSearch = this.debounce(async (query) => {
        if (query.length < 2) {
          searchResults.classList.remove('show');
          return;
        }

        try {
          const response = await window.api.getProductSuggestions(query);
          this.renderSearchResults(response.data, query);
        } catch (error) {
          console.error('Search failed:', error);
        }
      }, 300);

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        performSearch(query);
      });

      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
          searchResults.classList.add('show');
        }
      });

      // Hide results when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.classList.remove('show');
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput?.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      });
    }
  }

  /**
   * Render search results
   */
  renderSearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <p>No products found for "${query}"</p>
        </div>
      `;
    } else {
      searchResults.innerHTML = `
        <div class="search-results-list">
          ${results.map(product => `
            <a href="product.html?id=${product._id}" class="search-result-item">
              <img src="${product.thumbnail}" alt="${product.name}">
              <div class="search-result-details">
                <h4>${product.name}</h4>
                <p>${this.formatCurrency(product.price)}</p>
              </div>
            </a>
          `).join('')}
        </div>
        <div class="search-results-footer">
          <a href="products.html?search=${encodeURIComponent(query)}" class="btn btn-outline">
            View all results
          </a>
        </div>
      `;
    }

    searchResults.classList.add('show');
  }

  /**
   * Setup all utilities
   */
  setupAll() {
    this.setupStickyHeader();
    this.setupMobileMenu();
    this.setupSearch();
    this.setupScrollAnimations();
  }
}

// Create global utils instance
window.utils = new Utils();

// Setup utilities when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.utils.setupAll();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
