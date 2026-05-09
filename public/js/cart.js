/**
 * Cart Module - Handles shopping cart functionality
 */

class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.itemCount = 0;
    this.isLoading = false;
    this.init();
  }

  /**
   * Initialize cart
   */
  async init() {
    // Load cart from localStorage or API
    if (window.auth.isAuthenticated) {
      await this.loadCartFromAPI();
    } else {
      this.loadCartFromStorage();
    }
    
    this.updateUI();
    this.setupEventListeners();
  }

  /**
   * Load cart from API for authenticated users
   */
  async loadCartFromAPI() {
    try {
      this.isLoading = true;
      const response = await window.api.getCart();
      this.items = response.data.items;
      this.total = response.data.total;
      this.itemCount = response.data.itemCount;
      this.saveCartToStorage();
    } catch (error) {
      console.error('Failed to load cart from API:', error);
      // Fallback to localStorage
      this.loadCartFromStorage();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load cart from localStorage for guest users
   */
  loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('zeusnent_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        this.items = cartData.items || [];
        this.calculateTotals();
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      this.items = [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCartToStorage() {
    try {
      const cartData = {
        items: this.items,
        total: this.total,
        itemCount: this.itemCount
      };
      localStorage.setItem('zeusnent_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  /**
   * Add item to cart
   */
  async addItem(productId, quantity = 1, price, productData = {}) {
    try {
      this.isLoading = true;
      
      // Check if item already exists
      const existingItem = this.items.find(item => item.product === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          product: productId,
          quantity,
          price,
          name: productData.name || 'Product',
          image: productData.image || productData.thumbnail || 'https://via.placeholder.com/100',
          ...productData
        });
      }

      // Calculate new totals
      this.calculateTotals();

      // Save to storage
      this.saveCartToStorage();

      // Sync with API if authenticated
      if (window.auth.isAuthenticated) {
        await window.api.addToCart(productId, quantity, price);
      }

      // Update UI
      this.updateUI();
      
      // Show success message
      window.utils.showToast('Item added to cart!', 'success');
      
      // Trigger add to cart animation
      this.animateAddToCart(productId);
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { 
          action: 'add', 
          productId, 
          quantity, 
          cart: this.getState() 
        } 
      }));

      return true;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      window.utils.showToast('Failed to add item to cart', 'error');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(productId) {
    try {
      this.isLoading = true;
      
      const itemIndex = this.items.findIndex(item => item.product === productId);
      
      if (itemIndex > -1) {
        const removedItem = this.items[itemIndex];
        this.items.splice(itemIndex, 1);
        
        // Calculate new totals
        this.calculateTotals();

        // Save to storage
        this.saveCartToStorage();

        // Sync with API if authenticated
        if (window.auth.isAuthenticated) {
          await window.api.removeFromCart(productId);
        }

        // Update UI
        this.updateUI();
        
        // Show success message
        window.utils.showToast('Item removed from cart', 'info');
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { 
            action: 'remove', 
            productId, 
            cart: this.getState() 
          } 
        }));

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      window.utils.showToast('Failed to remove item from cart', 'error');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(productId, quantity) {
    try {
      this.isLoading = true;
      
      if (quantity <= 0) {
        return await this.removeItem(productId);
      }

      const item = this.items.find(item => item.product === productId);
      
      if (item) {
        item.quantity = quantity;
        
        // Calculate new totals
        this.calculateTotals();

        // Save to storage
        this.saveCartToStorage();

        // Sync with API if authenticated
        if (window.auth.isAuthenticated) {
          await window.api.updateCartItem(productId, quantity);
        }

        // Update UI
        this.updateUI();
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { 
            action: 'update', 
            productId, 
            quantity, 
            cart: this.getState() 
          } 
        }));

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      window.utils.showToast('Failed to update cart', 'error');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      this.isLoading = true;
      
      this.items = [];
      this.total = 0;
      this.itemCount = 0;

      // Clear storage
      localStorage.removeItem('zeusnent_cart');

      // Sync with API if authenticated
      if (window.auth.isAuthenticated) {
        await window.api.clearCart();
      }

      // Update UI
      this.updateUI();
      
      // Show success message
      window.utils.showToast('Cart cleared', 'info');
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('cartCleared', { 
        detail: { cart: this.getState() } 
      }));

      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      window.utils.showToast('Failed to clear cart', 'error');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculate cart totals
   */
  calculateTotals() {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get cart state
   */
  getState() {
    return {
      items: [...this.items],
      total: this.total,
      itemCount: this.itemCount,
      isLoading: this.isLoading
    };
  }

  /**
   * Get formatted total
   */
  getFormattedTotal() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.total);
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update cart count in header
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = this.itemCount;
      cartCount.style.display = this.itemCount > 0 ? 'block' : 'none';
    }

    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
      this.renderCartPage();
    }

    // Update cart dropdown if exists
    this.renderCartDropdown();
  }

  /**
   * Render cart page
   */
  renderCartPage() {
    const cartContainer = document.getElementById('cart-container');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = '';
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    // Render cart items
    cartContainer.innerHTML = this.items.map(item => `
      <div class="cart-item" data-product-id="${item.product}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease" data-product-id="${item.product}">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn increase" data-product-id="${item.product}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="cart-item-subtotal">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
        <button class="cart-item-remove" data-product-id="${item.product}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    // Update summary
    if (cartSummary) {
      cartSummary.innerHTML = `
        <div class="cart-summary-content">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${this.total.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>$${this.total.toFixed(2)}</span>
          </div>
          <a href="checkout.html" class="btn btn-primary btn-large">
            Proceed to Checkout
          </a>
          <a href="index.html" class="btn btn-outline">
            Continue Shopping
          </a>
        </div>
      `;
    }

    // Add event listeners to cart items
    this.attachCartItemListeners();
  }

  /**
   * Render cart dropdown
   */
  renderCartDropdown() {
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (!cartDropdown) return;

    if (this.items.length === 0) {
      cartDropdown.innerHTML = `
        <div class="cart-dropdown-empty">
          <i class="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <a href="products.html" class="btn btn-outline">Start Shopping</a>
        </div>
      `;
      return;
    }

    const recentItems = this.items.slice(0, 3);
    
    cartDropdown.innerHTML = `
      <div class="cart-dropdown-items">
        ${recentItems.map(item => `
          <div class="cart-dropdown-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-dropdown-item-details">
              <h4>${item.name}</h4>
              <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <button class="cart-dropdown-item-remove" data-product-id="${item.product}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('')}
      </div>
      <div class="cart-dropdown-footer">
        <div class="cart-dropdown-total">
          <span>Total:</span>
          <span>$${this.total.toFixed(2)}</span>
        </div>
        <div class="cart-dropdown-actions">
          <a href="cart.html" class="btn btn-outline">View Cart</a>
          <a href="checkout.html" class="btn btn-primary">Checkout</a>
        </div>
      </div>
    `;

    // Add event listeners
    this.attachCartDropdownListeners();
  }

  /**
   * Attach event listeners to cart items
   */
  attachCartItemListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        const item = this.items.find(item => item.product === productId);
        if (item && item.quantity > 1) {
          this.updateItemQuantity(productId, item.quantity - 1);
        }
      });
    });

    // Quantity increase buttons
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        const item = this.items.find(item => item.product === productId);
        if (item) {
          this.updateItemQuantity(productId, item.quantity + 1);
        }
      });
    });

    // Remove item buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        this.removeItem(productId);
      });
    });
  }

  /**
   * Attach event listeners to cart dropdown
   */
  attachCartDropdownListeners() {
    document.querySelectorAll('.cart-dropdown-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        this.removeItem(productId);
      });
    });
  }

  /**
   * Animate add to cart
   */
  animateAddToCart(productId) {
    const cartIcon = document.getElementById('cart-link');
    const productImage = document.querySelector(`[data-product-id="${productId}"] img`);
    
    if (cartIcon && productImage) {
      // Create flying image effect
      const flyingImage = productImage.cloneNode(true);
      flyingImage.style.cssText = `
        position: fixed;
        z-index: 9999;
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 50%;
        pointer-events: none;
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `;
      
      const productRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      
      flyingImage.style.left = productRect.left + 'px';
      flyingImage.style.top = productRect.top + 'px';
      
      document.body.appendChild(flyingImage);
      
      // Animate to cart
      setTimeout(() => {
        flyingImage.style.left = cartRect.left + 'px';
        flyingImage.style.top = cartRect.top + 'px';
        flyingImage.style.transform = 'scale(0)';
        flyingImage.style.opacity = '0';
      }, 10);
      
      // Remove element
      setTimeout(() => {
        document.body.removeChild(flyingImage);
      }, 800);
    }
    
    // Pulse cart icon
    if (cartIcon) {
      cartIcon.classList.add('animate-pulse');
      setTimeout(() => {
        cartIcon.classList.remove('animate-pulse');
      }, 1000);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.add-to-cart-btn');
        const productId = btn.dataset.productId;
        const price = parseFloat(btn.dataset.price);
        const productData = {
          name: btn.dataset.productName,
          image: btn.dataset.productImage
        };
        
        this.addItem(productId, 1, price, productData);
        
        // Add visual feedback
        btn.classList.add('added');
        btn.innerHTML = '<i class="fas fa-check"></i> Added';
        
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 2000);
      }
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          this.clearCart();
        }
      });
    }

    // Listen for authentication changes
    window.addEventListener('userLoggedIn', () => {
      this.loadCartFromAPI();
    });

    window.addEventListener('userLoggedOut', () => {
      this.items = [];
      this.total = 0;
      this.itemCount = 0;
      this.updateUI();
    });
  }

  /**
   * Merge guest cart with user cart after login
   */
  async mergeGuestCart() {
    if (this.items.length === 0) return;

    try {
      // Add each item from guest cart to user cart
      for (const item of this.items) {
        await window.api.addToCart(item.product, item.quantity, item.price);
      }
      
      // Reload cart from API to get synced state
      await this.loadCartFromAPI();
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
    }
  }
}

// Create global cart instance
window.cart = new Cart();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cart;
}
