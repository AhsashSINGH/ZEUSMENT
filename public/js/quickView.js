/**
 * Quick View Modal - Interactive product quick preview
 */

class QuickView {
  constructor() {
    this.currentProduct = null;
    this.modal = null;
    this.init();
  }

  /**
   * Initialize quick view functionality
   */
  init() {
    this.createQuickViewModal();
    this.setupQuickViewButtons();
    this.setupModalEvents();
  }

  /**
   * Create quick view modal
   */
  createQuickViewModal() {
    // Check if modal already exists
    this.modal = document.getElementById('quick-view-modal');
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.className = 'modal quick-view-modal';
    this.modal.id = 'quick-view-modal';
    this.modal.innerHTML = `
      <div class="modal-content quick-view-content">
        <button class="modal-close quick-view-close" id="quick-view-close">
          <i class="fas fa-times"></i>
        </button>
        <div class="quick-view-body" id="quick-view-body">
          <div class="quick-view-loading">
            <div class="spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
  }

  /**
   * Setup quick view buttons on product cards
   */
  setupQuickViewButtons() {
    // Add event delegation for dynamic content
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-view')) {
        e.preventDefault();
        const productId = e.target.closest('.quick-view').dataset.productId;
        this.openQuickView(productId);
      }
    });
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    const closeBtn = document.getElementById('quick-view-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeQuickView());
    }

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeQuickView();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeQuickView();
      }
    });
  }

  /**
   * Open quick view modal
   */
  async openQuickView(productId) {
    if (!productId) return;

    this.showLoading();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      const response = await window.api.getProduct(productId);
      this.currentProduct = response.data;
      this.renderProduct();
    } catch (error) {
      console.error('Failed to load product:', error);
      this.showError('Failed to load product details');
    }
  }

  /**
   * Close quick view modal
   */
  closeQuickView() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.currentProduct = null;
  }

  /**
   * Show loading state
   */
  showLoading() {
    const body = document.getElementById('quick-view-body');
    body.innerHTML = `
      <div class="quick-view-loading">
        <div class="spinner"></div>
        <p>Loading product details...</p>
      </div>
    `;
  }

  /**
   * Show error state
   */
  showError(message) {
    const body = document.getElementById('quick-view-body');
    body.innerHTML = `
      <div class="quick-view-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button class="btn btn-outline" onclick="window.quickView.closeQuickView()">
          Close
        </button>
      </div>
    `;
  }

  /**
   * Render product in quick view
   */
  renderProduct() {
    if (!this.currentProduct) return;

    const body = document.getElementById('quick-view-body');
    const product = this.currentProduct;

    body.innerHTML = `
      <div class="quick-view-layout">
        <!-- Product Images -->
        <div class="quick-view-images">
          <div class="quick-view-main-image">
            <img src="${product.thumbnail}" alt="${product.name}" id="quick-view-image">
          </div>
          <div class="quick-view-thumbnails">
            ${product.images.map((img, index) => `
              <button class="quick-thumb ${index === 0 ? 'active' : ''}" 
                      onclick="window.quickView.changeImage('${img.url}')"
                      data-image="${img.url}">
                <img src="${img.url}" alt="${img.alt}">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Product Details -->
        <div class="quick-view-details">
          <div class="quick-view-badges">
            ${this.renderBadges(product.badges || [])}
          </div>

          <h2 class="quick-view-title">${product.name}</h2>
          
          <div class="quick-view-rating">
            ${this.renderStars(product.rating?.average || 0)}
            <span class="rating-count">(${product.rating?.count || 0} reviews)</span>
          </div>

          <div class="quick-view-price">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice && product.originalPrice > product.price ? `
              <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
              <span class="discount-percentage">-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
            ` : ''}
          </div>

          <div class="quick-view-description">
            <p>${product.description}</p>
          </div>

          <!-- Product Variants -->
          <div class="quick-view-variants">
            ${this.renderVariants(product)}
          </div>

          <!-- Quantity and Actions -->
          <div class="quick-view-actions">
            <div class="quick-view-quantity">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button class="quantity-btn decrease" onclick="window.quickView.changeQuantity(-1)">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" id="quick-view-quantity" value="1" min="1" max="10" readonly>
                <button class="quantity-btn increase" onclick="window.quickView.changeQuantity(1)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div class="quick-view-buttons">
              <button class="btn btn-primary btn-large quick-view-add-cart" 
                      onclick="window.quickView.addToCart()">
                <i class="fas fa-shopping-cart"></i> Add to Cart
              </button>
              <button class="btn btn-outline quick-view-wishlist" 
                      onclick="window.quickView.addToWishlist()">
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>

          <!-- Product Features -->
          <div class="quick-view-features">
            <div class="feature-item">
              <i class="fas fa-shipping-fast"></i>
              <span>Free Shipping</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-shield-alt"></i>
              <span>Secure Payment</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-undo"></i>
              <span>30-Day Returns</span>
            </div>
          </div>

          <!-- View Full Details -->
          <div class="quick-view-footer">
            <a href="product.html?id=${product._id}" class="btn btn-outline btn-full">
              View Full Details
            </a>
          </div>
        </div>
      </div>
    `;

    // Initialize quantity
    this.currentQuantity = 1;
  }

  /**
   * Change main image
   */
  changeImage(imageUrl) {
    const mainImage = document.getElementById('quick-view-image');
    if (mainImage) {
      mainImage.src = imageUrl;
      
      // Update active thumbnail
      document.querySelectorAll('.quick-thumb').forEach(thumb => {
        thumb.classList.toggle('active', thumb.dataset.image === imageUrl);
      });
    }
  }

  /**
   * Change quantity
   */
  changeQuantity(delta) {
    const input = document.getElementById('quick-view-quantity');
    if (!input) return;

    let newQuantity = parseInt(input.value) + delta;
    newQuantity = Math.max(1, Math.min(10, newQuantity));
    
    input.value = newQuantity;
    this.currentQuantity = newQuantity;
  }

  /**
   * Add to cart from quick view
   */
  async addToCart() {
    if (!this.currentProduct) return;

    const btn = document.querySelector('.quick-view-add-cart');
    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      btn.disabled = true;

      await window.cart.addItem(
        this.currentProduct._id,
        this.currentQuantity,
        this.currentProduct.price,
        {
          name: this.currentProduct.name,
          image: this.currentProduct.thumbnail
        }
      );

      btn.innerHTML = '<i class="fas fa-check"></i> Added!';
      btn.classList.add('success');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('success');
      }, 2000);

    } catch (error) {
      console.error('Failed to add to cart:', error);
      btn.innerHTML = originalText;
      btn.disabled = false;
      window.utils.showToast('Failed to add to cart', 'error');
    }
  }

  /**
   * Add to wishlist from quick view
   */
  async addToWishlist() {
    if (!this.currentProduct) return;

    const btn = document.querySelector('.quick-view-wishlist');
    const originalIcon = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      await window.api.addToWishlist(this.currentProduct._id);

      btn.innerHTML = '<i class="fas fa-heart"></i>';
      btn.classList.add('active');
      
      window.utils.showToast('Added to wishlist!', 'success');

    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      btn.innerHTML = originalIcon;
      btn.disabled = false;
      window.utils.showToast('Failed to add to wishlist', 'error');
    }
  }

  /**
   * Render product badges
   */
  renderBadges(badges) {
    if (!badges.length) return '';

    return badges.map(badge => `
      <span class="badge badge-${badge}">${badge}</span>
    `).join('');
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
   * Render product variants
   */
  renderVariants(product) {
    let html = '';

    // Size selector
    if (product.sizes && product.sizes.length > 0) {
      html += '<div class="variant-selector size-selector"><label>Size:</label><div class="variant-options">';
      product.sizes.forEach(size => {
        html += `
          <button class="variant-btn size-btn ${size.inStock ? '' : 'disabled'}" 
                  ${size.inStock ? `onclick="window.quickView.selectSize('${size.name}')"` : 'disabled'}>
            ${size.name}
          </button>
        `;
      });
      html += '</div></div>';
    }

    // Color selector
    if (product.colors && product.colors.length > 0) {
      html += '<div class="variant-selector color-selector"><label>Color:</label><div class="variant-options">';
      product.colors.forEach(color => {
        html += `
          <button class="variant-btn color-btn ${color.inStock ? '' : 'disabled'}" 
                  style="background-color: ${color.hex}"
                  title="${color.name}"
                  ${color.inStock ? `onclick="window.quickView.selectColor('${color.name}', '${color.hex}')"` : 'disabled'}>
          </button>
        `;
      });
      html += '</div></div>';
    }

    return html;
  }

  /**
   * Select size variant
   */
  selectSize(size) {
    this.selectedSize = size;
    
    // Update UI
    document.querySelectorAll('.quick-view .size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === size);
    });

    window.utils.showToast(`Selected size: ${size}`, 'info');
  }

  /**
   * Select color variant
   */
  selectColor(name, hex) {
    this.selectedColor = { name, hex };
    
    // Update UI
    document.querySelectorAll('.quick-view .color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.style.backgroundColor === hex);
    });

    window.utils.showToast(`Selected color: ${name}`, 'info');
  }
}

// Create global quick view instance
window.quickView = new QuickView();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickView;
}
