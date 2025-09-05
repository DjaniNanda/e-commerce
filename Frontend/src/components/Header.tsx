import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Car, MapPin, Clock, Phone, ChevronDown, Settings, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { useCategories } from '../hooks/useCategories';

const Header: React.FC<{
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onCategoryClick?: (category: string) => void;
}> = ({
  onSearch = () => {},
  onCartClick = () => {},
  onCategoryClick = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { state } = useCart();
  const { categories } = useCategories();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCategories &&
        categoriesDropdownRef.current &&
        categoriesButtonRef.current &&
        !categoriesDropdownRef.current.contains(event.target as Node) &&
        !categoriesButtonRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
    } else {
      // If empty search, trigger a reset
      onSearch('');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    setIsMenuOpen(false);
    setShowCategories(false);
  };

  const searchSuggestions = [
    'Plaquette de frein',
    'Filtre à huile',
    'Amortisseur',
    'Pneus',
    'Batterie'
  ];

  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="relative">
      <header className="bg-white shadow-2xl sticky top-0 z-50 border-b border-gray-100 w-full">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-2 sm:py-3 w-full">
          <div className="w-full px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between text-sm sm:text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 animate-pulse" />
                  <span className="font-semibold">{t('header.delivery')}</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('header.hours')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                    className="bg-transparent text-white text-sm font-medium border-none outline-none cursor-pointer"
                  >
                    <option value="fr" className="text-black">FR</option>
                    <option value="en" className="text-black">EN</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="font-semibold text-base sm:text-sm">+237 6XX XXX XXX</span>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-4 group cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Car className="h-8 w-8 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-4 sm:h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-2xl font-black text-gray-800 group-hover:text-blue-600 transition-all duration-300 tracking-tight">
                  AUTO-BUSINESS
                </h1>
                <p className="text-base sm:text-sm text-gray-500 block font-medium">{t('header.tagline')}</p>
              </div>
            </div>

            {/* Search bar - Desktop */}
            {!isAdminPage && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8 relative">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('header.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
                />
                
                {isSearchFocused && searchQuery.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-gray-200 rounded-b-2xl shadow-2xl z-10 max-h-60 overflow-y-auto">
                    {searchSuggestions
                      .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            onSearch(suggestion);
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left px-6 py-4 hover:bg-blue-50 text-gray-700 border-b border-gray-100 last:border-b-0 transition-all duration-200 flex items-center space-x-3"
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                  </div>
                )}

                <button
                  onClick={(e) => handleSearch(e)}
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none font-medium"
                >
                  {t('header.search.button')}
                </button>
              </div>
              </div>
            )}

            {/* Cart and Menu */}
            <div className="flex items-center space-x-4">
              {!isAdminPage && (
                <button
                onClick={onCartClick}
                className="relative p-4 sm:p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-110 bg-gray-50 hover:bg-blue-50 rounded-2xl group shadow-sm hover:shadow-md"
                aria-label={`Panier avec ${totalItems} articles`}
              >
                <ShoppingCart className="h-8 w-8 sm:h-7 sm:w-7" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm sm:text-xs font-bold rounded-full h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center animate-bounce group-hover:animate-pulse shadow-lg">
                    {totalItems}
                  </span>
                )}
                </button>
              )}

              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-4 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="relative w-7 h-7">
                  <Menu className={`h-7 w-7 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} />
                  <X className={`h-7 w-7 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Search bar - Mobile */}
          {!isAdminPage && (
            <div className="md:hidden mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('header.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full pl-14 pr-20 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
              />
              <button
                onClick={(e) => handleSearch(e)}
                disabled={!searchQuery.trim()}
                className="absolute right-3 top-3 bottom-3 px-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!isAdminPage && (
          <nav className={`bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 transition-all duration-300 ${
          isMenuOpen ? 'block' : 'hidden md:block'
          } w-full`}>
          <div className="w-full px-4 sm:px-6">
            <div className="hidden md:flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <button
                  ref={categoriesButtonRef}
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Menu className="h-5 w-5" />
                  <span>{t('header.categories')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex space-x-2">
                  {categories.slice(2, 6).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium text-green-600 animate-pulse">●</span>
                <span className="ml-2">{t('header.stock')}</span>
              </div>
            </div>

            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-3 py-4 sm:py-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="text-left p-4 sm:p-6 text-gray-700 hover:text-blue-600 hover:bg-white rounded-xl sm:rounded-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-1"
                  >
                    <div className="font-semibold text-base sm:text-lg">{category.name}</div>
                    <div className="text-sm text-gray-500 mt-1 sm:mt-2">{t('products.view')} →</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </nav>
        )}
      </header>

      {/* Categories Dropdown - Moved outside header with proper z-index */}
      {showCategories && !isAdminPage && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={() => setShowCategories(false)}
          />
          
          {/* Dropdown */}
          <div
            ref={categoriesDropdownRef}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border border-gray-200 z-[70] rounded-b-2xl w-full"
          >
            <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="text-left p-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-blue-200 group transform hover:-translate-y-1 shadow-sm hover:shadow-lg"
                  >
                    <div className="font-semibold group-hover:font-bold transition-all">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{t('products.view')} →</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;