import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Header from './Header';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Cart from './Cart';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { FaWhatsapp } from 'react-icons/fa';
import { Product } from '../types';
import { Car, Grid, List, MapPin, Phone, Search, MessageCircle } from 'lucide-react';
import '../components styles/MainApp.css';

const MainApp: React.FC = () => {
  const { products, productsCount, loading, error, searchProducts, filterProducts } = useProducts();
  useCategories();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('price_asc');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000000] as [number, number]
  });

  // Use refs to prevent infinite loops
  const lastSearchQuery = useRef('');
  const lastSelectedCategory = useRef('');
  const lastFilters = useRef(filters);

  // Memoize filter parameters
  const filterParams = useMemo(() => {
    const params = {
      category: selectedCategory || filters.category || undefined,
      minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
      search: searchQuery || undefined,
      sortBy: sortBy
    };
    
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
  }, [searchQuery, selectedCategory, filters.category, filters.priceRange, sortBy]);

  // Initialize products on mount only
  useEffect(() => {
    if (!hasInitialized && !loading) {
      console.log('Initializing MainApp - loading initial products');
      setHasInitialized(true);
    }
  }, [hasInitialized, loading]);

  const handleSearch = useCallback(async (query: string) => {
    console.log('Search initiated:', query);
    
    // Prevent duplicate searches
    if (lastSearchQuery.current === query) {
      return;
    }
    lastSearchQuery.current = query;
    
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setSearchQuery('');
        setSelectedCategory('');
        setFilters({
          category: '',
          priceRange: [0, 1000000]
        });
        return;
      }
      
      setSearchQuery(query);
      setSelectedCategory('');
      setFilters({
        category: '',
        priceRange: [0, 1000000]
      });
      
      await searchProducts(trimmedQuery, sortBy);
      
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchProducts, sortBy]);

  // Effect to handle sort changes
  useEffect(() => {
    if (!hasInitialized) return;
    
    const applyFilters = async () => {
      await filterProducts({
        category: selectedCategory,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        search: searchQuery,
        sortBy
      });
    };
    
    applyFilters();
  }, [sortBy, hasInitialized]);

  const handleCategoryClick = useCallback(async (category: string) => {
    console.log('Category clicked:', category);
    
    // Prevent duplicate category clicks
    if (lastSelectedCategory.current === category) {
      return;
    }
    lastSelectedCategory.current = category;
    
    setSearchQuery('');
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category
    }));
    
    await filterProducts({
      category,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      search: '',
      sortBy
    });
  }, [filterProducts, filters.priceRange, sortBy]);

  const clearFilters = useCallback(() => {
    console.log('Clearing all filters');
    lastSearchQuery.current = '';
    lastSelectedCategory.current = '';
    
    setSearchQuery('');
    setSelectedCategory('');
    setFilters({
      category: '',
      priceRange: [0, 1000000]
    });
  }, []);

  // Loading state
  if (loading && (!products || products.length === 0) && !hasInitialized) {
    return (
      <div className="main-app__loading">
        <div className="main-app__loading-content">
          <div className="main-app__spinner"></div>
          <p className="main-app__loading-text">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!products || products.length === 0)) {
    return (
      <div className="main-app__error">
        <div className="main-app__error-content">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name_asc">Nom (A-Z)</option>
                <option value="name_desc">Nom (Z-A)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                aria-label="Vue en grille"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                aria-label="Vue en liste"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-app">
      <Header
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onCategoryClick={handleCategoryClick}
      />

      <main className="main-app__container">

        {/* Controls */}
        <div className="main-app__controls">
          <div className="main-app__sort-controls">
            <div className="main-app__sort-select">
              <label htmlFor="sort-by" className="main-app__sort-label">Trier par :</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="main-app__sort-select-input"
              >
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name_asc">Nom (A-Z)</option>
                <option value="name_desc">Nom (Z-A)</option>
              </select>
            </div>
            <div className="main-app__view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`main-app__view-button ${viewMode === 'grid' ? 'main-app__view-button--active' : ''}`}
                aria-label="Vue en grille"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`main-app__view-button ${viewMode === 'list' ? 'main-app__view-button--active' : ''}`}
                aria-label="Vue en liste"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="main-app__products-loading">
            <div className="main-app__spinner"></div>
            <p className="main-app__products-loading-text">Chargement des produits...</p>
          </div>
        ) : (productsCount || 0) === 0 && (searchQuery || selectedCategory) ? (
          <div className="main-app__no-results">
            <div className="main-app__no-results-icon">
              <Search />
            </div>
            <h3 className="main-app__no-results-title">Aucun produit trouvé</h3>
            <p className="main-app__no-results-description">
              Essayez de modifier vos critères de recherche ou explorez nos catégories.
            </p>
            <button
              onClick={clearFilters}
              className="main-app__no-results-button"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (productsCount || 0) > 0 ? (
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
        ) : (
          <div className="main-app__ready-search">
            <div className="main-app__ready-search-icon">
              <Search />
            </div>
            <h3 className="main-app__ready-search-title">Prêt à rechercher</h3>
            <p className="main-app__ready-search-description">
              Utilisez la barre de recherche ou parcourez nos catégories pour trouver les pièces dont vous avez besoin.
            </p>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/237699849474"
        target="_blank"
        rel="noopener noreferrer"
        className="main-app__whatsapp-button"
        aria-label="Contact us on WhatsApp"
      >
        <span className="main-app__whatsapp-icon">
        <FaWhatsapp/>
        </span>
      </a>

      {/* Footer */}
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
                  <p className="main-app__footer-brand-tagline">L'excellence automobile</p>
                </div>
              </div>
              <p className="main-app__footer-description">
                Votre partenaire de confiance pour toutes vos pièces automobiles. Qualité, fiabilité et service client exceptionnel depuis plus de 10 ans.
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
              <h4>Contact</h4>
              <div className="main-app__footer-contact">
                <div className="main-app__footer-contact-item">
                  <Phone className="main-app__footer-contact-icon" />
                  <a 
                    href="tel:+237699849474" 
                    className="main-app__footer-contact-text hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    +237 699 849 474
                  </a>
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
              <h4>Horaires d'ouverture</h4>
              <div className="main-app__footer-hours">
                <div className="main-app__footer-hours-item">
                  <span>Lundi - Vendredi:</span>
                  <span className="main-app__footer-hours-time">8h00 - 18h30</span>
                </div>
                <div className="main-app__footer-hours-item">
                  <span>Samedi:</span>
                  <span className="main-app__footer-hours-time">8h00 - 18h30</span>
                </div>
                <div className="main-app__footer-hours-item">
                  <span>Dimanche:</span>
                  <span className="main-app__footer-hours-time">8h00 - 18h30</span>
                </div>
              </div>
            </div>
          </div>

          <div className="main-app__footer-bottom">
            <div className="main-app__footer-bottom-content">
              <p className="main-app__footer-copyright">
                &copy; 2025 AUTO-BUSINESS. Tous droits réservés.
              </p>
              <div className="main-app__footer-links">
                <button className="main-app__footer-link">Politique de confidentialité</button>
                <button className="main-app__footer-link">Conditions d'utilisation</button>
                <button className="main-app__footer-link">Support</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;