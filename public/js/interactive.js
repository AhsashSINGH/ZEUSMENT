/**
 * Interactive Features Module - Enhanced user interactions
 */

class InteractiveFeatures {
  constructor() {
    this.init();
  }

  /**
   * Initialize all interactive features
   */
  init() {
    this.setupImageGallery();
    this.setupLiveChat();
    this.setupProductComparison();
    this.setupCountdownTimers();
    this.setupProductVariants();
    this.setupFloatingActions();
    this.setupKeyboardShortcuts();
    this.setupInteractiveRecommendations();
    this.setupDragAndDrop();
    this.setupInteractiveLoading();
  }

  /**
   * Interactive Product Image Gallery with Zoom
   */
  setupImageGallery() {
    const galleryContainers = document.querySelectorAll('.product-gallery');
    
    galleryContainers.forEach(container => {
      this.createImageGallery(container);
    });
  }

  createImageGallery(container) {
    const images = container.querySelectorAll('.gallery-image');
    const mainImage = container.querySelector('.main-image');
    const thumbnails = container.querySelector('.thumbnails');
    
    if (!mainImage || !thumbnails) return;

    // Create thumbnail navigation
    const thumbnailList = document.createElement('div');
    thumbnailList.className = 'thumbnail-list';
    
    images.forEach((img, index) => {
      const thumb = document.createElement('div');
      thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${img.src}" alt="Thumbnail ${index + 1}">`;
      
      thumb.addEventListener('click', () => {
        this.switchImage(mainImage, img, thumbnailList, thumb);
      });
      
      thumbnailList.appendChild(thumb);
    });
    
    thumbnails.appendChild(thumbnailList);

    // Add zoom functionality
    this.addImageZoom(mainImage);
    
    // Add touch/swipe support
    this.addSwipeSupport(container, images, mainImage, thumbnailList);
  }

  switchImage(mainImage, newImage, thumbnailList, activeThumb) {
    mainImage.src = newImage.src;
    mainImage.alt = newImage.alt;
    
    // Update active thumbnail
    thumbnailList.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.classList.remove('active');
    });
    activeThumb.classList.add('active');
    
    // Add fade effect
    mainImage.style.opacity = '0';
    setTimeout(() => {
      mainImage.style.opacity = '1';
    }, 100);
  }

  addImageZoom(img) {
    let isZoomed = false;
    let zoomLevel = 1;
    const maxZoom = 3;
    const zoomStep = 0.5;

    // Create zoom overlay
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'zoom-overlay';
    zoomOverlay.innerHTML = `
      <div class="zoom-controls">
        <button class="zoom-in"><i class="fas fa-search-plus"></i></button>
        <button class="zoom-out"><i class="fas fa-search-minus"></i></button>
        <button class="zoom-reset"><i class="fas fa-compress"></i></button>
        <button class="zoom-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="zoom-image-container">
        <img src="${img.src}" alt="${img.alt}" class="zoom-image">
      </div>
    `;
    
    document.body.appendChild(zoomOverlay);

    // Click to zoom
    img.addEventListener('click', () => {
      isZoomed = true;
      zoomLevel = 2;
      zoomOverlay.classList.add('active');
      this.updateZoomImage(zoomOverlay, img.src, zoomLevel);
    });

    // Zoom controls
    zoomOverlay.querySelector('.zoom-in').addEventListener('click', () => {
      zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
      this.updateZoomImage(zoomOverlay, img.src, zoomLevel);
    });

    zoomOverlay.querySelector('.zoom-out').addEventListener('click', () => {
      zoomLevel = Math.max(zoomLevel - zoomStep, 1);
      this.updateZoomImage(zoomOverlay, img.src, zoomLevel);
    });

    zoomOverlay.querySelector('.zoom-reset').addEventListener('click', () => {
      zoomLevel = 1;
      this.updateZoomImage(zoomOverlay, img.src, zoomLevel);
    });

    zoomOverlay.querySelector('.zoom-close').addEventListener('click', () => {
      zoomOverlay.classList.remove('active');
      isZoomed = false;
    });

    // Click outside to close
    zoomOverlay.addEventListener('click', (e) => {
      if (e.target === zoomOverlay) {
        zoomOverlay.classList.remove('active');
        isZoomed = false;
      }
    });

    // Mouse wheel zoom
    zoomOverlay.addEventListener('wheel', (e) => {
      if (isZoomed) {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
        } else {
          zoomLevel = Math.max(zoomLevel - zoomStep, 1);
        }
        this.updateZoomImage(zoomOverlay, img.src, zoomLevel);
      }
    });
  }

  updateZoomImage(overlay, src, zoomLevel) {
    const zoomImage = overlay.querySelector('.zoom-image');
    zoomImage.style.transform = `scale(${zoomLevel})`;
    
    // Update zoom level indicator
    const indicator = overlay.querySelector('.zoom-level');
    if (!indicator) {
      const levelDiv = document.createElement('div');
      levelDiv.className = 'zoom-level';
      levelDiv.textContent = `${Math.round(zoomLevel * 100)}%`;
      overlay.querySelector('.zoom-controls').appendChild(levelDiv);
    } else {
      indicator.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  }

  addSwipeSupport(container, images, mainImage, thumbnailList) {
    let startX = 0;
    let currentX = 0;
    let currentIndex = 0;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    container.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', () => {
      const diff = startX - currentX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex < images.length - 1) {
          currentIndex++;
        } else if (diff < 0 && currentIndex > 0) {
          currentIndex--;
        }

        const newImage = images[currentIndex];
        const activeThumb = thumbnailList.children[currentIndex];
        this.switchImage(mainImage, newImage, thumbnailList, activeThumb);
      }
    });
  }

  /**
   * Live Chat Support Widget
   */
  setupLiveChat() {
    // Create chat widget
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
      <div class="chat-bubble" id="chat-bubble">
        <i class="fas fa-comments"></i>
        <span>Chat with us</span>
      </div>
      <div class="chat-window" id="chat-window">
        <div class="chat-header">
          <h4>Customer Support</h4>
          <button class="chat-minimize" id="chat-minimize">
            <i class="fas fa-minus"></i>
          </button>
          <button class="chat-close" id="chat-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="message bot">
            <div class="message-content">
              <p>Hello! 👋 Welcome to Zeusnent! How can I help you today?</p>
            </div>
            <div class="message-time">Just now</div>
          </div>
        </div>
        <div class="chat-input-container">
          <div class="quick-replies">
            <button class="quick-reply" data-message="Track my order">Track my order</button>
            <button class="quick-reply" data-message="Product information">Product information</button>
            <button class="quick-reply" data-message="Return policy">Return policy</button>
          </div>
          <div class="chat-input-wrapper">
            <input type="text" id="chat-input" placeholder="Type your message...">
            <button id="chat-send">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(chatWidget);
    this.setupChatFunctionality(chatWidget);
  }

  setupChatFunctionality(widget) {
    const bubble = widget.querySelector('#chat-bubble');
    const window = widget.querySelector('#chat-window');
    const minimize = widget.querySelector('#chat-minimize');
    const close = widget.querySelector('#chat-close');
    const input = widget.querySelector('#chat-input');
    const send = widget.querySelector('#chat-send');
    const messages = widget.querySelector('#chat-messages');

    // Toggle chat window
    bubble.addEventListener('click', () => {
      window.classList.add('active');
      bubble.classList.add('hidden');
      input.focus();
    });

    minimize.addEventListener('click', () => {
      window.classList.remove('active');
      bubble.classList.remove('hidden');
    });

    close.addEventListener('click', () => {
      window.classList.remove('active');
      bubble.classList.remove('hidden');
    });

    // Send message
    const sendMessage = () => {
      const message = input.value.trim();
      if (message) {
        this.addChatMessage(messages, message, 'user');
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
          this.simulateBotResponse(messages, message);
        }, 1000);
      }
    };

    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Quick replies
    widget.querySelectorAll('.quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.dataset.message;
        input.value = message;
        sendMessage();
      });
    });
  }

  addChatMessage(container, message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
      </div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  simulateBotResponse(container, userMessage) {
    const responses = {
      'track my order': 'I can help you track your order! Please provide your order number, and I\'ll look that up for you.',
      'product information': 'I\'d be happy to help with product information! What specific product are you interested in?',
      'return policy': 'Our return policy allows returns within 30 days of purchase. Items must be in original condition. Would you like more details?',
      'default': 'Thank you for your message! A customer support representative will be with you shortly. Is there anything specific I can help you with in the meantime?'
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }

    this.addChatMessage(container, response, 'bot');
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  /**
   * Product Comparison Tool
   */
  setupProductComparison() {
    // Add compare buttons to products
    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.productId;
      const compareBtn = document.createElement('button');
      compareBtn.className = 'compare-btn';
      compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
      compareBtn.title = 'Compare';
      compareBtn.addEventListener('click', () => this.addToComparison(productId));
      
      const actions = card.querySelector('.product-actions');
      if (actions) {
        actions.appendChild(compareBtn);
      }
    });

    // Create comparison modal
    this.createComparisonModal();
  }

  addToComparison(productId) {
    if (!this.compareProducts) this.compareProducts = [];
    
    if (this.compareProducts.includes(productId)) {
      window.utils.showToast('Product already in comparison', 'warning');
      return;
    }

    if (this.compareProducts.length >= 4) {
      window.utils.showToast('Maximum 4 products can be compared', 'warning');
      return;
    }

    this.compareProducts.push(productId);
    this.updateComparisonButton();
    window.utils.showToast('Product added to comparison', 'success');
  }

  updateComparisonButton() {
    let compareBtn = document.querySelector('.floating-compare-btn');
    
    if (!compareBtn && this.compareProducts.length > 0) {
      compareBtn = document.createElement('button');
      compareBtn.className = 'floating-compare-btn';
      compareBtn.innerHTML = `
        <i class="fas fa-balance-scale"></i>
        <span class="compare-count">${this.compareProducts.length}</span>
      `;
      compareBtn.addEventListener('click', () => this.showComparisonModal());
      document.body.appendChild(compareBtn);
    }
    
    if (compareBtn) {
      const count = compareBtn.querySelector('.compare-count');
      if (count) {
        count.textContent = this.compareProducts.length;
      }
      
      if (this.compareProducts.length === 0) {
        compareBtn.remove();
      }
    }
  }

  createComparisonModal() {
    const modal = document.createElement('div');
    modal.className = 'modal comparison-modal';
    modal.id = 'comparison-modal';
    modal.innerHTML = `
      <div class="modal-content comparison-content">
        <div class="modal-header">
          <h3>Compare Products</h3>
          <button class="modal-close" id="comparison-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="comparison-body" id="comparison-body">
          <!-- Comparison content will be loaded here -->
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#comparison-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  async showComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    const body = modal.querySelector('#comparison-body');
    
    if (this.compareProducts.length === 0) {
      window.utils.showToast('No products to compare', 'warning');
      return;
    }

    // Show loading state
    body.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    modal.classList.add('active');

    try {
      // Load product details
      const products = await Promise.all(
        this.compareProducts.map(id => window.api.getProduct(id))
      );

      // Render comparison table
      body.innerHTML = this.renderComparisonTable(products.map(p => p.data));
    } catch (error) {
      body.innerHTML = '<p>Failed to load products for comparison</p>';
    }
  }

  renderComparisonTable(products) {
    const features = [
      'Image', 'Name', 'Price', 'Rating', 'Category', 'Brand', 'In Stock', 'Actions'
    ];

    let html = '<div class="comparison-table"><table>';
    
    // Header row
    html += '<thead><tr><th>Features</th>';
    products.forEach(product => {
      html += `<th>${product.name}</th>`;
    });
    html += '</tr></thead>';

    // Feature rows
    features.forEach(feature => {
      html += '<tr><td class="feature-name">' + feature + '</td>';
      
      products.forEach(product => {
        html += '<td class="feature-value">';
        
        switch(feature) {
          case 'Image':
            html += `<img src="${product.thumbnail}" alt="${product.name}" class="compare-image">`;
            break;
          case 'Name':
            html += `<a href="product.html?id=${product._id}">${product.name}</a>`;
            break;
          case 'Price':
            html += `$${product.price.toFixed(2)}`;
            break;
          case 'Rating':
            html += `${product.rating?.average || 0} ★ (${product.rating?.count || 0})`;
            break;
          case 'Category':
            html += product.category?.name || 'N/A';
            break;
          case 'Brand':
            html += product.brand || 'N/A';
            break;
          case 'In Stock':
            html += product.stock > 0 ? 
              '<span class="in-stock">✓ In Stock</span>' : 
              '<span class="out-stock">✗ Out of Stock</span>';
            break;
          case 'Actions':
            html += `
              <button class="btn btn-primary btn-sm" onclick="window.cart.addItem('${product._id}', 1, ${product.price})">
                Add to Cart
              </button>
            `;
            break;
        }
        
        html += '</td>';
      });
      html += '</tr>';
    });
    
    html += '</table></div>';
    
    // Clear comparison button
    html += `
      <div class="comparison-actions">
        <button class="btn btn-outline" onclick="window.interactive.clearComparison()">
          Clear Comparison
        </button>
      </div>
    `;
    
    return html;
  }

  clearComparison() {
    this.compareProducts = [];
    this.updateComparisonButton();
    document.getElementById('comparison-modal').classList.remove('active');
    window.utils.showToast('Comparison cleared', 'info');
  }

  /**
   * Animated Countdown Timers for Deals
   */
  setupCountdownTimers() {
    const countdownElements = document.querySelectorAll('.countdown-timer');
    
    countdownElements.forEach(element => {
      const targetDate = element.dataset.targetDate;
      if (targetDate) {
        this.startCountdown(element, new Date(targetDate));
      }
    });

    // Add countdown to homepage promo banner
    this.addPromoCountdown();
  }

  startCountdown(element, targetDate) {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        element.innerHTML = '<span class="expired">Deal Ended</span>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      element.innerHTML = `
        <div class="countdown-segments">
          <div class="countdown-segment">
            <span class="countdown-value">${days}</span>
            <span class="countdown-label">Days</span>
          </div>
          <div class="countdown-segment">
            <span class="countdown-value">${hours.toString().padStart(2, '0')}</span>
            <span class="countdown-label">Hours</span>
          </div>
          <div class="countdown-segment">
            <span class="countdown-value">${minutes.toString().padStart(2, '0')}</span>
            <span class="countdown-label">Mins</span>
          </div>
          <div class="countdown-segment">
            <span class="countdown-value">${seconds.toString().padStart(2, '0')}</span>
            <span class="countdown-label">Secs</span>
          </div>
        </div>
      `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  addPromoCountdown() {
    const promoBanner = document.querySelector('.promo-banner');
    if (promoBanner) {
      const countdown = document.createElement('div');
      countdown.className = 'promo-countdown';
      countdown.dataset.targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
      
      const title = promoBanner.querySelector('h2');
      if (title) {
        title.insertAdjacentElement('afterend', countdown);
        this.startCountdown(countdown, new Date(countdown.dataset.targetDate));
      }
    }
  }

  /**
   * Interactive Size/Color Selectors
   */
  setupProductVariants() {
    const variantSelectors = document.querySelectorAll('.product-variants');
    
    variantSelectors.forEach(selector => {
      this.createVariantSelector(selector);
    });
  }

  createVariantSelector(container) {
    // Size selector
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeContainer = document.createElement('div');
    sizeContainer.className = 'variant-selector size-selector';
    sizeContainer.innerHTML = '<label>Size:</label>';
    
    sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.className = 'variant-btn size-btn';
      btn.textContent = size;
      btn.addEventListener('click', () => this.selectVariant(btn, 'size'));
      sizeContainer.appendChild(btn);
    });
    
    // Color selector
    const colors = [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Red', hex: '#FF0000' },
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Green', hex: '#00FF00' }
    ];
    
    const colorContainer = document.createElement('div');
    colorContainer.className = 'variant-selector color-selector';
    colorContainer.innerHTML = '<label>Color:</label>';
    
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'variant-btn color-btn';
      btn.style.backgroundColor = color.hex;
      btn.title = color.name;
      btn.addEventListener('click', () => this.selectVariant(btn, 'color'));
      colorContainer.appendChild(btn);
    });
    
    container.appendChild(sizeContainer);
    container.appendChild(colorContainer);
  }

  selectVariant(button, type) {
    // Remove active class from siblings
    button.parentElement.querySelectorAll('.variant-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Add visual feedback
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
    
    // Update product info if needed
    this.updateProductVariant(type, button);
  }

  updateProductVariant(type, button) {
    // This would typically update the product display
    // For demo purposes, just show a toast
    const value = type === 'size' ? button.textContent : button.title;
    window.utils.showToast(`Selected ${type}: ${value}`, 'info');
  }

  /**
   * Floating Action Buttons
   */
  setupFloatingActions() {
    const fab = document.createElement('div');
    fab.className = 'floating-action-buttons';
    fab.innerHTML = `
      <button class="fab-main" id="fab-main">
        <i class="fas fa-plus"></i>
      </button>
      <div class="fab-menu" id="fab-menu">
        <button class="fab-item" data-action="chat" title="Chat">
          <i class="fas fa-comments"></i>
        </button>
        <button class="fab-item" data-action="compare" title="Compare">
          <i class="fas fa-balance-scale"></i>
        </button>
        <button class="fab-item" data-action="wishlist" title="Wishlist">
          <i class="fas fa-heart"></i>
        </button>
        <button class="fab-item" data-action="top" title="Back to top">
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(fab);
    this.setupFabFunctionality(fab);
  }

  setupFabFunctionality(fab) {
    const main = fab.querySelector('#fab-main');
    const menu = fab.querySelector('#fab-menu');
    let isOpen = false;

    main.addEventListener('click', () => {
      isOpen = !isOpen;
      menu.classList.toggle('active', isOpen);
      main.classList.toggle('active', isOpen);
      
      // Rotate icon
      const icon = main.querySelector('i');
      icon.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    // Handle fab item clicks
    fab.querySelectorAll('.fab-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleFabAction(action);
        
        // Close menu
        isOpen = false;
        menu.classList.remove('active');
        main.classList.remove('active');
        main.querySelector('i').style.transform = 'rotate(0deg)';
      });
    });
  }

  handleFabAction(action) {
    switch(action) {
      case 'chat':
        document.querySelector('#chat-bubble')?.click();
        break;
      case 'compare':
        if (this.compareProducts && this.compareProducts.length > 0) {
          this.showComparisonModal();
        } else {
          window.utils.showToast('Add products to compare first', 'info');
        }
        break;
      case 'wishlist':
        window.location.href = 'wishlist.html';
        break;
      case 'top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
    }
  }

  /**
   * Keyboard Shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only trigger shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // Ctrl/Cmd + / for shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.showShortcutsHelp();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }

      // Number keys for quick navigation
      if (e.key >= '1' && e.key <= '9') {
        this.handleNumberShortcut(e.key);
      }
    });
  }

  showShortcutsHelp() {
    const shortcuts = [
      { key: 'Ctrl + K', description: 'Focus search' },
      { key: 'Ctrl + /', description: 'Show shortcuts' },
      { key: 'Escape', description: 'Close modals' },
      { key: '1-9', description: 'Quick navigation' },
      { key: 'C', description: 'Open cart' },
      { key: 'W', description: 'Open wishlist' },
      { key: 'H', description: 'Go home' }
    ];

    let html = '<div class="shortcuts-help"><h3>Keyboard Shortcuts</h3><ul>';
    shortcuts.forEach(shortcut => {
      html += `<li><kbd>${shortcut.key}</kbd> - ${shortcut.description}</li>`;
    });
    html += '</ul></div>';

    window.utils.showToast(html, 'info', 5000);
  }

  handleNumberShortcut(key) {
    switch(key) {
      case '1':
        window.location.href = 'index.html';
        break;
      case '2':
        window.location.href = 'products.html';
        break;
      case '3':
        window.location.href = 'cart.html';
        break;
      case '4':
        window.location.href = 'wishlist.html';
        break;
      case '5':
        window.location.href = 'orders.html';
        break;
      case '6':
        window.location.href = 'profile.html';
        break;
      case '7':
        window.location.href = 'about.html';
        break;
      case '8':
        window.location.href = 'contact.html';
        break;
      case '9':
        window.location.href = 'deals.html';
        break;
    }
  }

  /**
   * Interactive Product Recommendations
   */
  setupInteractiveRecommendations() {
    this.createRecommendationCarousel();
    this.setupPersonalizedRecommendations();
  }

  createRecommendationCarousel() {
    const sections = document.querySelectorAll('.recommendations-section');
    
    sections.forEach(section => {
      const carousel = document.createElement('div');
      carousel.className = 'recommendation-carousel';
      carousel.innerHTML = `
        <div class="carousel-header">
          <h3>Recommended for You</h3>
          <div class="carousel-controls">
            <button class="carousel-control prev" data-direction="prev">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-control next" data-direction="next">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="carousel-container">
          <!-- Products will be loaded here -->
        </div>
      `;
      
      section.appendChild(carousel);
      this.loadRecommendationProducts(carousel);
    });
  }

  async loadRecommendationProducts(carousel) {
    const container = carousel.querySelector('.carousel-container');
    
    try {
      const products = await window.api.getFeaturedProducts(8);
      container.innerHTML = products.data.map(product => 
        this.createMiniProductCard(product)
      ).join('');
      
      this.setupCarouselControls(carousel);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }

  createMiniProductCard(product) {
    return `
      <div class="mini-product-card" data-product-id="${product._id}">
        <div class="mini-product-image">
          <img src="${product.thumbnail}" alt="${product.name}">
          <div class="mini-product-overlay">
            <button class="mini-quick-view" data-product-id="${product._id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="mini-add-to-cart" 
                    data-product-id="${product._id}" 
                    data-price="${product.price}">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
        <div class="mini-product-info">
          <h4>${product.name}</h4>
          <p class="mini-price">$${product.price.toFixed(2)}</p>
        </div>
      </div>
    `;
  }

  setupCarouselControls(carousel) {
    const container = carousel.querySelector('.carousel-container');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');
    
    let scrollPosition = 0;
    const scrollAmount = 300;
    
    prevBtn.addEventListener('click', () => {
      scrollPosition = Math.max(0, scrollPosition - scrollAmount);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
  }

  setupPersonalizedRecommendations() {
    // Analyze user behavior and show personalized recommendations
    if (window.auth.isAuthenticated) {
      this.analyzeUserPreferences();
    }
  }

  analyzeUserPreferences() {
    // This would typically analyze user's browsing history, purchases, etc.
    // For demo purposes, we'll show random recommendations
    const userCategories = ['Electronics', 'Fashion', 'Home'];
    const randomCategory = userCategories[Math.floor(Math.random() * userCategories.length)];
    
    console.log('Personalizing recommendations for:', randomCategory);
  }

  /**
   * Drag and Drop Cart Reordering
   */
  setupDragAndDrop() {
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
      this.enableCartReordering(cartContainer);
    }
  }

  enableCartReordering(container) {
    let draggedElement = null;

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('cart-item')) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('cart-item')) {
        e.target.style.opacity = '';
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(container, e.clientY);
      
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.cart-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /**
   * Interactive Loading Animations
   */
  setupInteractiveLoading() {
    this.createInteractiveLoaders();
    this.setProgressiveLoading();
  }

  createInteractiveLoaders() {
    // Replace default spinners with interactive ones
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
      this.createInteractiveSpinner(spinner);
    });
  }

  createInteractiveSpinner(container) {
    container.innerHTML = `
      <div class="interactive-loader">
        <div class="loader-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <div class="loader-text">Loading amazing products...</div>
      </div>
    `;
  }

  setProgressiveLoading() {
    // Implement progressive image loading with blur effect
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    });
  }
}

// Create global interactive features instance
window.interactive = new InteractiveFeatures();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveFeatures;
}
