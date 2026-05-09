/**
 * Advanced Search System - Enhanced search with filters and suggestions
 */

class AdvancedSearch {
  constructor() {
    this.searchHistory = [];
    this.suggestions = [];
    this.filters = {};
    this.isSearchOpen = false;
    this.init();
  }

  /**
   * Initialize advanced search
   */
  init() {
    this.setupSearchInterface();
    this.loadSearchHistory();
    this.setupSearchListeners();
    this.setupFilterListeners();
  }

  /**
   * Setup enhanced search interface
   */
  setupSearchInterface() {
    const searchContainer = document.getElementById('search-container');
    if (!searchContainer) return;

    // Enhance existing search input
    const searchInput = searchContainer.querySelector('.search-input');
    const searchResults = searchContainer.querySelector('.search-results');

    // Add advanced search button
    const advancedBtn = document.createElement('button');
    advancedBtn.className = 'advanced-search-btn';
    advancedBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';
    advancedBtn.title = 'Advanced Search';
    advancedBtn.addEventListener('click', () => this.openAdvancedSearch());
    
    searchContainer.querySelector('.search-btn').insertAdjacentElement('beforebegin', advancedBtn);

    // Create advanced search modal
    this.createAdvancedSearchModal();
  }

  /**
   * Create advanced search modal
   */
  createAdvancedSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal advanced-search-modal';
    modal.id = 'advanced-search-modal';
    modal.innerHTML = `
      <div class="modal-content advanced-search-content">
        <div class="modal-header">
          <h3>Advanced Search</h3>
          <button class="modal-close" id="advanced-search-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="advanced-search-body">
          <div class="search-section">
            <h4>Search Terms</h4>
            <div class="search-inputs">
              <input type="text" id="advanced-search-input" placeholder="Enter product name, brand, or keywords...">
              <div class="search-suggestions" id="advanced-suggestions">
                <!-- Suggestions will appear here -->
              </div>
            </div>
          </div>

          <div class="filters-section">
            <h4>Filters</h4>
            <div class="filters-grid">
              <!-- Category Filter -->
              <div class="filter-group">
                <label>Category</label>
                <select id="filter-category" multiple>
                  <!-- Categories will be loaded dynamically -->
                </select>
              </div>

              <!-- Price Range -->
              <div class="filter-group">
                <label>Price Range</label>
                <div class="price-range-inputs">
                  <input type="number" id="price-min" placeholder="Min" min="0">
                  <span>-</span>
                  <input type="number" id="price-max" placeholder="Max" min="0">
                </div>
                <div class="price-range-slider">
                  <input type="range" id="price-range-slider" min="0" max="1000" step="10">
                  <div class="price-range-display">
                    $<span id="range-min">0</span> - $<span id="range-max">1000</span>
                  </div>
                </div>
              </div>

              <!-- Rating Filter -->
              <div class="filter-group">
                <label>Minimum Rating</label>
                <div class="rating-filter">
                  <div class="rating-stars" id="rating-filter-stars">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                  </div>
                  <span id="rating-text">Any Rating</span>
                </div>
              </div>

              <!-- Brand Filter -->
              <div class="filter-group">
                <label>Brand</label>
                <select id="filter-brand">
                  <option value="">All Brands</option>
                  <!-- Brands will be loaded dynamically -->
                </select>
              </div>

              <!-- Badges Filter -->
              <div class="filter-group">
                <label>Special Offers</label>
                <div class="badge-filters">
                  <label class="checkbox-label">
                    <input type="checkbox" name="badges" value="new">
                    <span class="checkmark"></span>
                    New Arrivals
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="badges" value="trending">
                    <span class="checkmark"></span>
                    Trending
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="badges" value="sale">
                    <span class="checkmark"></span>
                    On Sale
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="badges" value="featured">
                    <span class="checkmark"></span>
                    Featured
                  </label>
                </div>
              </div>

              <!-- Stock Filter -->
              <div class="filter-group">
                <label>Availability</label>
                <div class="stock-filters">
                  <label class="checkbox-label">
                    <input type="checkbox" name="stock" value="instock" checked>
                    <span class="checkmark"></span>
                    In Stock
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="stock" value="outofstock">
                    <span class="checkmark"></span>
                    Out of Stock
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Search History -->
          <div class="history-section">
            <div class="history-header">
              <h4>Recent Searches</h4>
              <button class="btn btn-link" id="clear-history">Clear</button>
            </div>
            <div class="search-history-list" id="search-history-list">
              <!-- Search history will appear here -->
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" id="reset-filters">Reset Filters</button>
          <button class="btn btn-primary" id="apply-search">Search Products</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupAdvancedSearchListeners();
  }

  /**
   * Setup search listeners
   */
  setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    let searchTimeout;
    let currentQuery = '';

    // Enhanced search input handler
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      currentQuery = query;

      clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        searchResults.classList.remove('show');
        return;
      }

      searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const items = searchResults.querySelectorAll('.search-result-item');
      let currentIndex = -1;

      // Find current selected item
      items.forEach((item, index) => {
        if (item.classList.contains('selected')) {
          currentIndex = index;
        }
      });

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, items.length - 1);
          this.selectSearchResult(items, currentIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, -1);
          this.selectSearchResult(items, currentIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= 0) {
            items[currentIndex].click();
          } else {
            this.executeSearch(currentQuery);
          }
          break;
        case 'Escape':
          searchResults.classList.remove('show');
          searchInput.blur();
          break;
      }
    });

    // Focus/blur handling
    searchInput.addEventListener('focus', () => {
      if (currentQuery.length >= 2) {
        this.performSearch(currentQuery);
      } else {
        this.showSearchHistory();
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('show');
      }
    });
  }

  /**
   * Setup advanced search modal listeners
   */
  setupAdvancedSearchListeners() {
    const modal = document.getElementById('advanced-search-modal');
    const closeBtn = document.getElementById('advanced-search-close');
    const applyBtn = document.getElementById('apply-search');
    const resetBtn = document.getElementById('reset-filters');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Close modal
    closeBtn.addEventListener('click', () => this.closeAdvancedSearch());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeAdvancedSearch();
      }
    });

    // Apply search
    applyBtn.addEventListener('click', () => this.applyAdvancedSearch());

    // Reset filters
    resetBtn.addEventListener('click', () => this.resetFilters());

    // Clear history
    clearHistoryBtn.addEventListener('click', () => this.clearSearchHistory());

    // Advanced search input
    const advancedInput = document.getElementById('advanced-search-input');
    if (advancedInput) {
      advancedInput.addEventListener('input', (e) => {
        this.showSuggestions(e.target.value);
      });
    }

    // Price range slider
    const priceSlider = document.getElementById('price-range-slider');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.updatePriceRange(e.target.value);
      });
    }

    // Rating filter
    const ratingStars = document.querySelectorAll('#rating-filter-stars i');
    ratingStars.forEach(star => {
      star.addEventListener('click', () => {
        this.setRatingFilter(parseInt(star.dataset.rating));
      });
    });
  }

  /**
   * Setup filter listeners
   */
  setupFilterListeners() {
    // Load categories and brands
    this.loadFilterOptions();
  }

  /**
   * Perform search with suggestions
   */
  async performSearch(query) {
    try {
      // Get suggestions
      const suggestions = await window.api.getProductSuggestions(query, 5);
      this.suggestions = suggestions.data;

      // Get search results
      const results = await window.api.searchProducts(query, 8);
      
      this.renderSearchResults(results.data, query);
    } catch (error) {
      console.error('Search failed:', error);
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
          <button class="btn btn-link" onclick="window.advancedSearch.openAdvancedSearch()">
            Try advanced search
          </button>
        </div>
      `;
    } else {
      searchResults.innerHTML = `
        <div class="search-results-list">
          ${results.map(product => `
            <div class="search-result-item" data-product-id="${product._id}">
              <div class="search-result-image">
                <img src="${product.thumbnail}" alt="${product.name}">
              </div>
              <div class="search-result-details">
                <h4>${this.highlightMatch(product.name, query)}</h4>
                <p class="search-result-category">${product.category?.name || 'Uncategorized'}</p>
                <p class="search-result-price">$${product.price.toFixed(2)}</p>
              </div>
              <div class="search-result-actions">
                <button class="btn btn-primary btn-sm quick-add" 
                        onclick="window.cart.addItem('${product._id}', 1, ${product.price})">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="search-results-footer">
          <button class="btn btn-outline" onclick="window.advancedSearch.executeSearch('${query}')">
            View all results for "${query}"
          </button>
        </div>
      `;
    }

    searchResults.classList.add('show');
  }

  /**
   * Highlight matching text
   */
  highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Select search result with keyboard
   */
  selectSearchResult(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });

    if (index >= 0) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Execute search
   */
  executeSearch(query) {
    if (!query.trim()) return;

    // Add to search history
    this.addToSearchHistory(query);

    // Redirect to products page with search
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }

  /**
   * Open advanced search modal
   */
  openAdvancedSearch() {
    const modal = document.getElementById('advanced-search-modal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('advanced-search-input').focus();
      this.renderSearchHistory();
    }
  }

  /**
   * Close advanced search modal
   */
  closeAdvancedSearch() {
    const modal = document.getElementById('advanced-search-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Apply advanced search
   */
  applyAdvancedSearch() {
    const query = document.getElementById('advanced-search-input').value.trim();
    const filters = this.collectFilters();

    // Add to search history
    if (query) {
      this.addToSearchHistory(query);
    }

    // Build search URL
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });

    // Redirect to products page
    window.location.href = `products.html?${params.toString()}`;
  }

  /**
   * Collect all filter values
   */
  collectFilters() {
    const filters = {};

    // Category
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories;
      }
    }

    // Price range
    const minPrice = document.getElementById('price-min').value;
    const maxPrice = document.getElementById('price-max').value;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    // Rating
    const ratingFilter = document.querySelector('#rating-filter-stars .fas.fa-star');
    if (ratingFilter) {
      filters.minRating = parseInt(ratingFilter.dataset.rating);
    }

    // Brand
    const brandSelect = document.getElementById('filter-brand');
    if (brandSelect && brandSelect.value) {
      filters.brand = brandSelect.value;
    }

    // Badges
    const badgeCheckboxes = document.querySelectorAll('input[name="badges"]:checked');
    const badges = Array.from(badgeCheckboxes).map(cb => cb.value);
    if (badges.length > 0) {
      filters.badges = badges;
    }

    // Stock
    const stockCheckboxes = document.querySelectorAll('input[name="stock"]:checked');
    const stock = Array.from(stockCheckboxes).map(cb => cb.value);
    if (stock.length > 0 && stock.length < 2) {
      filters.inStock = stock.includes('instock');
    }

    return filters;
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    document.getElementById('advanced-search-input').value = '';
    document.getElementById('filter-category').selectedIndex = -1;
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('price-range-slider').value = '1000';
    document.getElementById('filter-brand').selectedIndex = 0;
    
    // Reset rating
    document.querySelectorAll('#rating-filter-stars i').forEach(star => {
      star.className = 'far fa-star';
    });
    document.getElementById('rating-text').textContent = 'Any Rating';

    // Reset checkboxes
    document.querySelectorAll('#advanced-search-modal input[type="checkbox"]').forEach(cb => {
      cb.checked = cb.name === 'stock' && cb.value === 'instock';
    });

    // Update price range display
    this.updatePriceRange(1000);
  }

  /**
   * Update price range display
   */
  updatePriceRange(value) {
    document.getElementById('range-max').textContent = value;
  }

  /**
   * Set rating filter
   */
  setRatingFilter(rating) {
    const stars = document.querySelectorAll('#rating-filter-stars i');
    const ratingText = document.getElementById('rating-text');

    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = 'fas fa-star';
      } else {
        star.className = 'far fa-star';
      }
    });

    ratingText.textContent = `${rating} Stars & Up`;
  }

  /**
   * Show search suggestions
   */
  showSuggestions(query) {
    const suggestionsContainer = document.getElementById('advanced-suggestions');
    if (!suggestionsContainer) return;

    if (query.length < 2) {
      suggestionsContainer.innerHTML = '';
      return;
    }

    const filteredSuggestions = this.suggestions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredSuggestions.length > 0) {
      suggestionsContainer.innerHTML = `
        <div class="suggestions-list">
          ${filteredSuggestions.map(suggestion => `
            <div class="suggestion-item" onclick="window.advancedSearch.selectSuggestion('${suggestion.name}')">
              <i class="fas fa-search"></i>
              ${this.highlightMatch(suggestion.name, query)}
            </div>
          `).join('')}
        </div>
      `;
    } else {
      suggestionsContainer.innerHTML = '';
    }
  }

  /**
   * Select suggestion
   */
  selectSuggestion(suggestion) {
    document.getElementById('advanced-search-input').value = suggestion;
    document.getElementById('advanced-suggestions').innerHTML = '';
  }

  /**
   * Search history management
   */
  loadSearchHistory() {
    const saved = localStorage.getItem('zeusnent_search_history');
    if (saved) {
      this.searchHistory = JSON.parse(saved);
    }
  }

  addToSearchHistory(query) {
    if (!query.trim()) return;

    // Remove existing entry
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 10
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('zeusnent_search_history', JSON.stringify(this.searchHistory));
  }

  renderSearchHistory() {
    const historyList = document.getElementById('search-history-list');
    if (!historyList) return;

    if (this.searchHistory.length === 0) {
      historyList.innerHTML = '<p class="no-history">No recent searches</p>';
    } else {
      historyList.innerHTML = `
        <div class="history-items">
          ${this.searchHistory.map(query => `
            <div class="history-item" onclick="window.advancedSearch.selectHistoryItem('${query}')">
              <i class="fas fa-history"></i>
              <span>${query}</span>
              <button class="history-remove" onclick="event.stopPropagation(); window.advancedSearch.removeFromHistory('${query}')">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  selectHistoryItem(query) {
    document.getElementById('advanced-search-input').value = query;
    this.applyAdvancedSearch();
  }

  removeFromHistory(query) {
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    localStorage.setItem('zeusnent_search_history', JSON.stringify(this.searchHistory));
    this.renderSearchHistory();
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('zeusnent_search_history');
    this.renderSearchHistory();
  }

  /**
   * Show search history in main search
   */
  showSearchHistory() {
    const searchResults = document.getElementById('search-results');
    if (!searchResults || this.searchHistory.length === 0) return;

    searchResults.innerHTML = `
      <div class="search-history-dropdown">
        <div class="history-header">
          <h4>Recent Searches</h4>
        </div>
        <div class="history-items">
          ${this.searchHistory.slice(0, 5).map(query => `
            <div class="history-item" onclick="window.advancedSearch.executeSearch('${query}')">
              <i class="fas fa-history"></i>
              <span>${query}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    searchResults.classList.add('show');
  }

  /**
   * Load filter options
   */
  async loadFilterOptions() {
    try {
      // Load categories
      const categories = await window.api.getTopLevelCategories();
      const categorySelect = document.getElementById('filter-category');
      if (categorySelect) {
        categorySelect.innerHTML = categories.data.map(category => `
          <option value="${category._id}">${category.name}</option>
        `).join('');
      }

      // Load brands (mock data for now)
      const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell'];
      const brandSelect = document.getElementById('filter-brand');
      if (brandSelect) {
        brandSelect.innerHTML = '<option value="">All Brands</option>' + 
          brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  }
}

// Create global advanced search instance
window.advancedSearch = new AdvancedSearch();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedSearch;
}
