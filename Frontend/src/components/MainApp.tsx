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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-6 sm:mb-4"></div>
          <p className="text-gray-600 text-xl sm:text-base">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no products
  if (error && (!products || products.length === 0)) {
    console.log('Error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-3xl sm:text-2xl">⚠️</span>
          </div>
          <h3 className="text-2xl sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-6 sm:mb-4 text-lg sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-8 py-4 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-lg sm:text-base"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main app with products:', products?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 w-full overflow-x-hidden">
      <Header
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onCategoryClick={handleCategoryClick}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
        {/* Hero Section - Enhanced for Mobile */}
        {!searchQuery && !selectedCategory && (
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 mb-8 sm:mb-12 lg:mb-16 text-center relative overflow-hidden shadow-2xl w-full">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 sm:mb-8 lg:mb-10 leading-tight">
                {t('hero.title')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  {t('hero.subtitle')}
                </span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 lg:mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base lg:text-lg font-medium">
                {[
                  { icon: "✓", text: t('hero.stock') },
                  { icon: "⚡", text: t('hero.delivery') },
                  { icon: "💎", text: t('hero.quality') },
                  { icon: "🛡️", text: t('hero.service') }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm px-8 py-4 sm:px-4 sm:py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                    <span className="mr-2 sm:mr-3 text-base sm:text-lg lg:text-xl">{item.icon}</span>
                    <span className="text-sm sm:text-base lg:text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Toolbar for Mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-10 bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100 space-y-4 sm:space-y-0 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <div className="text-gray-600">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{productsCount || 0}</span>
              <span className="ml-2 sm:ml-3 text-base sm:text-lg lg:text-xl">
                {(productsCount || 0) === 1 ? t('products.found') : t('products.found.plural')}
              </span>
            </div>
            {(searchQuery || selectedCategory) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full sm:w-auto">
                {searchQuery && (
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 sm:px-6 sm:py-3 lg:px-6 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg font-medium">
                    {t('products.search')}: "{searchQuery}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-green-100 text-green-800 px-4 py-2 sm:px-6 sm:py-3 lg:px-6 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg font-medium">
                    {t('products.category')}: {selectedCategory}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-500 text-sm sm:text-base lg:text-lg underline py-2 px-2"
                >
                  {t('products.clear.filters')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-end">
            <span className="text-sm sm:text-base lg:text-lg text-gray-500">{t('products.view')}:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-5 sm:p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600 shadow-md' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <Grid className="h-8 w-8 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-5 sm:p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600 shadow-md' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <List className="h-8 w-8 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading && hasSearched ? (
          <div className="text-center py-16 sm:py-20 lg:py-24 w-full">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-6 sm:mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl">{t('common.loading')}</p>
          </div>
        ) : (productsCount || 0) === 0 && hasSearched ? (
          <div className="text-center py-16 sm:py-20 lg:py-24 px-4 sm:px-6 w-full">
            <div className="w-32 h-32 sm:w-24 sm:h-24 mx-auto mb-8 sm:mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Search className="h-14 w-14 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">{t('products.none.found')}</h3>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed">
              {t('products.none.description')}
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg"
            >
              {t('products.view.all')}
            </button>
          </div>
        ) : hasSearched || (productsCount || 0) > 0 ? (
          <div className={`grid gap-4 sm:gap-6 lg:gap-8 w-full ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
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
          <div className="text-center py-20 sm:py-24 lg:py-28 px-4 sm:px-6 w-full">
            <div className="w-40 h-40 sm:w-24 sm:h-24 mx-auto mb-10 sm:mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Search className="h-18 w-18 sm:h-10 sm:w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">{t('products.ready.search')}</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
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
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16 sm:py-20 lg:py-24 mt-16 sm:mt-20 lg:mt-24 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5 mb-6 sm:mb-8 lg:mb-10">
                <div className="w-20 h-20 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                  <Car className="h-11 w-11 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black">AUTO-BUSINESS</h3>
                  <p className="text-gray-400 text-sm sm:text-base lg:text-lg">{t('footer.excellence')}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-lg text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4 sm:space-x-6">
                {['📧', '📱', '🌐'].map((icon, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-lg sm:text-xl lg:text-2xl"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl lg:text-2xl">{t('footer.contact')}</h4>
              <div className="text-gray-300 space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                  <Phone className="h-8 w-8 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-base sm:text-lg lg:text-xl">+237 XXX XXX XXX</span>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                  <span className="text-blue-400 text-base sm:text-lg lg:text-2xl">📧</span>
                  <span className="text-base sm:text-lg lg:text-xl">contact@auto-business.cm</span>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                  <MapPin className="h-8 w-8 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-base sm:text-lg lg:text-xl">Yaoundé, Cameroun</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl lg:text-2xl">{t('footer.hours')}</h4>
              <div className="text-gray-300 space-y-3 sm:space-y-4">
                <div className="flex justify-between text-base sm:text-lg lg:text-xl">
                  <span>{t('footer.monday.friday')}:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg lg:text-xl">
                  <span>{t('footer.saturday')}:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg lg:text-xl">
                  <span>{t('footer.sunday')}:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 sm:pt-10 lg:pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 sm:space-y-6 md:space-y-0">
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg text-center md:text-left">
                &copy; 2025 AUTO-BUSINESS. {t('footer.rights')}.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-sm sm:text-base lg:text-lg text-gray-400">
                <button className="hover:text-white transition-colors py-2 px-1">{t('footer.privacy')}</button>
                <button className="hover:text-white transition-colors py-2 px-1">{t('footer.terms')}</button>
                <button className="hover:text-white transition-colors py-2 px-1">{t('footer.support')}</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;