import React, { useState, useCallback, useMemo } from 'react';
import Header from './Header';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Cart from './Cart';
import { useTranslation } from '../context/TranslationContext';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Product } from '../types';
import { Car, Grid, List, MapPin, Phone, Search } from 'lucide-react';
import './MainApp.css';

const MainApp: React.FC = () => {
  console.log('MainApp component rendering...');
  
  const { products, productsCount, loading, error, searchProducts, filterProducts } = useProducts();
  const { t } = useTranslation();
  useCategories();
  
  console.log('Products:', products, 'Count:', productsCount, 'Loading:', loading, 'Error:', error);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000000] as [number, number]
  });

  // Memoize filter parameters to prevent unnecessary re-renders
  const filterParams = useMemo(() => {
    const params = {
      category: selectedCategory || filters.category || undefined,
      minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
      search: searchQuery || undefined,
    };
    
    // Remove undefined values
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
  }, [searchQuery, selectedCategory, filters.category, filters.priceRange]);

  // Use useCallback to prevent function recreation on every render
  const applyFilters = useCallback(async () => {
    try {
      // Don't apply filters during initial loading
      if (loading) {
        console.log('Skipping filter application - still loading');
        return;
      }

      console.log('Applying filters:', filterParams);
      
      if (Object.keys(filterParams).length > 0) {
        await filterProducts(filterParams);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }, [filterParams, loading, filterProducts]);

  // Track if we've made an API call for the current filter parameters
  const [lastFilterParams, setLastFilterParams] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  // Apply filters when filterParams change (but not loading state)
  React.useEffect(() => {
    console.log('Filter effect triggered', { filterParams, loading, hasSearched });
    
    // Only apply filters if we're not in search mode and have filter parameters
    if (!loading && !searchQuery && Object.keys(filterParams).length > 0) {
      const filterParamsString = JSON.stringify(filterParams);
      const lastFilterParamsString = JSON.stringify(lastFilterParams);
      
      if (filterParamsString !== lastFilterParamsString) {
        console.log('Filter parameters changed, applying filters');
        setLastFilterParams(filterParams);
        setHasSearched(true);
        applyFilters();
      } else {
        console.log('Filter parameters unchanged, skipping API call');
      }
    } else if (Object.keys(filterParams).length === 0 && hasSearched && !searchQuery) {
      // Reset when filters are cleared
      console.log('Filters cleared, resetting search state');
      setHasSearched(false);
      setLastFilterParams({});
    }
  }, [filterParams, loading, applyFilters, lastFilterParams, hasSearched, searchQuery]);

  // Load all products on initial mount
  React.useEffect(() => {
    console.log('Initial load effect triggered');
    if (!loading && !hasSearched && !searchQuery && Object.keys(filterParams).length === 0) {
      console.log('Loading all products on initial mount');
      // This will trigger the products hook to load all products
      setHasSearched(true);
    }
  }, [loading, hasSearched, searchQuery, filterParams]);

  const handleSearch = useCallback(async (query: string) => {
    console.log('Search initiated:', query);
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        // If empty search, reset to show all products or clear results
        setSearchQuery('');
        setSelectedCategory('');
        setHasSearched(false);
        setLastFilterParams({});
        return;
      }
      
      setSearchQuery(query);
      setSelectedCategory('');
      setFilters({
        category: '',
        priceRange: [0, 1000000]
      });
      
      // Call search directly instead of using filter effect
      await searchProducts(trimmedQuery);
      setHasSearched(true);
      
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchProducts]);

  const handleCategoryClick = useCallback((category: string) => {
    console.log('Category clicked:', category);
    setSearchQuery(''); // Clear search when selecting category
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category }));
    setHasSearched(false); // Reset search state to use filter effect
  }, []);

  const clearFilters = useCallback(() => {
    console.log('Clearing all filters');
    setSearchQuery('');
    setSelectedCategory('');
    setFilters({
      category: '',
      priceRange: [0, 1000000]
    });
    setHasSearched(false);
    setLastFilterParams({});
  }, []);

  // Add a loading state check
  if (loading && (!products || products.length === 0)) {
    console.log('Still loading...');
    return (
      <div className="main-app__loading">
        <div className="main-app__loading-content">
          <div className="main-app__spinner"></div>
          <p className="main-app__loading-text">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no products
  if (error && (!products || products.length === 0)) {
    console.log('Error state:', error);
    return (
      <div className="main-app__error">
        <div className="main-app__error-content">
          <div className="main-app__error-icon">
            <span>⚠️</span>
          </div>
          <h3 className="main-app__error-title">Erreur de chargement</h3>
          <p className="main-app__error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="main-app__error-button"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main app with products:', products?.length || 0);

  return (
    <div className="main-app">
      <Header
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onCategoryClick={handleCategoryClick}
      />

      <main className="main-app__container">
        {/* Hero Section - Enhanced for Mobile */}
        {!searchQuery && !selectedCategory && (
          <div className="main-app__hero">
            <div className="main-app__hero-overlay"></div>
            <div className="main-app__hero-decoration--top"></div>
            <div className="main-app__hero-decoration--bottom"></div>
            <div className="main-app__hero-content">
              <h2 className="main-app__hero-title">
                {t('hero.title')}
                <span className="main-app__hero-subtitle">
                  {t('hero.subtitle')}
                </span>
              </h2>
              <p className="main-app__hero-description">
                {t('hero.description')}
              </p>
              <div className="main-app__hero-features">
                {[
                  { icon: "✓", text: t('hero.stock') },
                  { icon: "⚡", text: t('hero.delivery') },
                  { icon: "💎", text: t('hero.quality') },
                  { icon: "🛡️", text: t('hero.service') }
                ].map((item, index) => (
                  <div key={index} className="main-app__hero-feature">
                    <span className="main-app__hero-feature-icon">{item.icon}</span>
                    <span className="main-app__hero-feature-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Toolbar for Mobile */}
        <div className="main-app__toolbar">
          <div className="main-app__toolbar-left">
            <div className="main-app__toolbar-stats">
              <span className="main-app__toolbar-count">{productsCount || 0}</span>
              <span className="main-app__toolbar-label">
                {(productsCount || 0) === 1 ? t('products.found') : t('products.found.plural')}
              </span>
            </div>
            {(searchQuery || selectedCategory) && (
              <div className="main-app__toolbar-filters">
                {searchQuery && (
                  <span className="main-app__filter-tag main-app__filter-tag--search">
                    {t('products.search')}: "{searchQuery}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="main-app__filter-tag main-app__filter-tag--category">
                    {t('products.category')}: {selectedCategory}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="main-app__clear-filters"
                >
                  {t('products.clear.filters')}
                </button>
              </div>
            )}
          </div>

          <div className="main-app__toolbar-right">
            <span className="main-app__view-label">{t('products.view')}:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`main-app__view-button ${
                viewMode === 'grid' 
                  ? 'main-app__view-button--active' 
                  : 'main-app__view-button--inactive'
              }`}
            >
              <Grid className="main-app__view-icon" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`main-app__view-button ${
                viewMode === 'list' 
                  ? 'main-app__view-button--active' 
                  : 'main-app__view-button--inactive'
              }`}
            >
              <List className="main-app__view-icon" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading && hasSearched ? (
          <div className="main-app__products-loading">
            <div className="main-app__spinner"></div>
            <p className="main-app__products-loading-text">{t('common.loading')}</p>
          </div>
        ) : (productsCount || 0) === 0 && hasSearched ? (
          <div className="main-app__no-results">
            <div className="main-app__no-results-icon">
              <Search />
            </div>
            <h3 className="main-app__no-results-title">{t('products.none.found')}</h3>
            <p className="main-app__no-results-description">
              {t('products.none.description')}
            </p>
            <button
              onClick={clearFilters}
              className="main-app__no-results-button"
            >
              {t('products.view.all')}
            </button>
          </div>
        ) : hasSearched || (productsCount || 0) > 0 ? (
          <div className={`main-app__products-grid ${
            viewMode === 'grid' 
              ? 'main-app__products-grid--grid' 
              : 'main-app__products-grid--list'
          }`}>
            {(products || []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="main-app__ready-search">
            <div className="main-app__ready-search-icon">
              <Search />
            </div>
            <h3 className="main-app__ready-search-title">{t('products.ready.search')}</h3>
            <p className="main-app__ready-search-description">
              {t('products.ready.description')}
            </p>
          </div>
        ) : null}
      </main>

      {/* Enhanced Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Enhanced Cart */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Enhanced Footer for Mobile */}
      <footer className="main-app__footer">
        <div className="main-app__footer-container">
          <div className="main-app__footer-content">
            <div className="main-app__footer-brand">
              <div className="main-app__footer-logo">
                <div className="main-app__footer-logo-icon">
                  <Car />
                </div>
                <div>
                  <h3 className="main-app__footer-brand-name">AUTO-BUSINESS</h3>
                  <p className="main-app__footer-brand-tagline">{t('footer.excellence')}</p>
                </div>
              </div>
              <p className="main-app__footer-description">
                {t('footer.description')}
              </p>
              <div className="main-app__footer-social">
                {['📧', '📱', '🌐'].map((icon, index) => (
                  <button
                    key={index}
                    className="main-app__footer-social-button"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="main-app__footer-section">
              <h4>{t('footer.contact')}</h4>
              <div className="main-app__footer-contact">
                <div className="main-app__footer-contact-item">
                  <Phone className="main-app__footer-contact-icon" />
                  <span className="main-app__footer-contact-text">+237 XXX XXX XXX</span>
                </div>
                <div className="main-app__footer-contact-item">
                  <span className="main-app__footer-contact-icon">📧</span>
                  <span className="main-app__footer-contact-text">contact@auto-business.cm</span>
                </div>
                <div className="main-app__footer-contact-item">
                  <MapPin className="main-app__footer-contact-icon" />
                  <span className="main-app__footer-contact-text">Yaoundé, Cameroun</span>
                </div>
              </div>
            </div>
            
            <div className="main-app__footer-section">
              <h4>{t('footer.hours')}</h4>
              <div className="main-app__footer-hours">
                <div className="main-app__footer-hours-item">
                  <span>{t('footer.monday.friday')}:</span>
                  <span className="main-app__footer-hours-time">8h30 - 22h30</span>
                </div>
                <div className="main-app__footer-hours-item">
                  <span>{t('footer.saturday')}:</span>
                  <span className="main-app__footer-hours-time">8h30 - 22h30</span>
                </div>
                <div className="main-app__footer-hours-item">
                  <span>{t('footer.sunday')}:</span>
                  <span className="main-app__footer-hours-time">8h30 - 22h30</span>
                </div>
              </div>
            </div>
          </div>

          <div className="main-app__footer-bottom">
            <div className="main-app__footer-bottom-content">
              <p className="main-app__footer-copyright">
                &copy; 2025 AUTO-BUSINESS. {t('footer.rights')}.
              </p>
              <div className="main-app__footer-links">
                <button className="main-app__footer-link">{t('footer.privacy')}</button>
                <button className="main-app__footer-link">{t('footer.terms')}</button>
                <button className="main-app__footer-link">{t('footer.support')}</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;