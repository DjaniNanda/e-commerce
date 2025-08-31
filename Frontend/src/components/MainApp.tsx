import React, { useState, useCallback, useMemo } from 'react';
import Header from './Header';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Cart from './Cart';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Product } from '../types';
import { Car, Grid, List, MapPin, Phone, Search } from 'lucide-react';

const MainApp: React.FC = () => {
  console.log('MainApp component rendering...');
  
  const { products, productsCount, loading, error, searchProducts, filterProducts } = useProducts();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no products
  if (error && (!products || products.length === 0)) {
    console.log('Error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main app with products:', products?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onCategoryClick={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!searchQuery && !selectedCategory && (
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-3xl p-12 sm:p-10 mb-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="relative z-10">
              <h2 className="text-5xl sm:text-4xl md:text-5xl font-black mb-8 sm:mb-6 leading-tight">
                Pièces Automobiles
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  de Qualité Premium
                </span>
              </h2>
              <p className="text-2xl sm:text-xl md:text-2xl mb-10 sm:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Livraison gratuite à Yaoundé • Paiement à la livraison • Garantie assurée
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-base sm:text-sm font-medium">
                {[
                  { icon: "✓", text: "Stock permanent" },
                  { icon: "⚡", text: "Livraison rapide" },
                  { icon: "💎", text: "Qualité garantie" },
                  { icon: "🛡️", text: "Service 7j/7" }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm px-5 py-3 sm:px-4 sm:py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                    <span className="mr-2">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Updated Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 bg-white rounded-2xl p-8 sm:p-6 shadow-sm border border-gray-100 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-gray-600">
              <span className="text-3xl sm:text-2xl font-bold text-blue-600">{productsCount || 0}</span>
              <span className="ml-2 text-lg sm:text-base">produit{(productsCount || 0) !== 1 ? 's' : ''} trouvé{(productsCount || 0) !== 1 ? 's' : ''}</span>
            </div>
            {(searchQuery || selectedCategory) && (
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 sm:px-3 sm:py-1 rounded-full text-base sm:text-sm font-medium">
                    Recherche: "{searchQuery}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-green-100 text-green-800 px-4 py-2 sm:px-3 sm:py-1 rounded-full text-base sm:text-sm font-medium">
                    Catégorie: {selectedCategory}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-500 text-base sm:text-sm underline"
                >
                  Effacer filtres
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-base sm:text-sm text-gray-500 hidden sm:block">Vue:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-4 sm:p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600 shadow-md' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <Grid className="h-6 w-6 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-4 sm:p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600 shadow-md' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <List className="h-6 w-6 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading && hasSearched ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        ) : (productsCount || 0) === 0 && hasSearched ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Nous n'avons pas trouvé de produits correspondant à vos critères. 
              Essayez de modifier votre recherche ou parcourir nos catégories.
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Voir tous les produits
            </button>
          </div>
        ) : hasSearched ? (
          <div className={`grid gap-6 ${
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
          <div className="text-center py-20">
            <div className="w-32 h-32 sm:w-24 sm:h-24 mx-auto mb-8 sm:mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Search className="h-14 w-14 sm:h-10 sm:w-10 text-blue-500" />
            </div>
            <h3 className="text-3xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-3">Prêt à rechercher ?</h3>
            <p className="text-lg sm:text-base text-gray-500 mb-8 sm:mb-6 max-w-md mx-auto">
              Utilisez la barre de recherche ci-dessus ou sélectionnez une catégorie pour commencer.
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20 sm:py-16 mt-20">
        <div className="container mx-auto px-6 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-8 mb-16 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center space-x-4 sm:space-x-3 mb-8 sm:mb-6">
                <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                  <Car className="h-9 w-9 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl sm:text-2xl font-black">AUTO-BUSINESS</h3>
                  <p className="text-gray-400 text-base sm:text-sm">Excellence automobile</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md text-lg sm:text-base">
                Votre partenaire de confiance pour toutes vos pièces automobiles au Cameroun. 
                Nous nous engageons à fournir des produits de qualité premium avec un service exceptionnel.
              </p>
              <div className="flex space-x-5 sm:space-x-4 mt-8 sm:mt-6">
                {['📧', '📱', '🌐'].map((icon, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-xl sm:text-base"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 sm:mb-6 text-xl sm:text-lg">Contact</h4>
              <div className="text-gray-300 space-y-4 sm:space-y-3">
                <div className="flex items-center space-x-4 sm:space-x-3">
                  <Phone className="h-6 w-6 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-lg sm:text-base">+237 XXX XXX XXX</span>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-3">
                  <span className="text-blue-400 text-xl sm:text-base">📧</span>
                  <span className="text-lg sm:text-base">contact@auto-business.cm</span>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-3">
                  <MapPin className="h-6 w-6 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-lg sm:text-base">Yaoundé, Cameroun</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-8 sm:mb-6 text-xl sm:text-lg">Horaires</h4>
              <div className="text-gray-300 space-y-3 sm:space-y-2">
                <div className="flex justify-between text-lg sm:text-base">
                  <span>Lun - Ven:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
                <div className="flex justify-between text-lg sm:text-base">
                  <span>Samedi:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
                <div className="flex justify-between text-lg sm:text-base">
                  <span>Dimanche:</span>
                  <span className="text-green-400 font-medium">8h30 - 22h30</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-10 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-base sm:text-sm">
                &copy; 2025 AUTO-BUSINESS. Tous droits réservés.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-base sm:text-sm text-gray-400">
                <button className="hover:text-white transition-colors">Politique de confidentialité</button>
                <button className="hover:text-white transition-colors">Conditions d'utilisation</button>
                <button className="hover:text-white transition-colors">Support</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;