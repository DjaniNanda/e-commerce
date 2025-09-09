import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Car, MapPin, Clock, Phone, ChevronDown, Settings, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { useCategories } from '../hooks/useCategories';
import '../components styles/Header.css';

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
    <div className="header-wrapper">
      <header className="header">
        {/* Top bar */}
        <div className="top-bar">
          <div className="container">
            <div className="top-bar-content">
              <div className="top-bar-left">
                <div className="top-bar-item">
                  <MapPin className="icon icon-pulse" />
                  <span className="font-medium">{t('header.delivery')}</span>
                </div>
                <div className="top-bar-item top-bar-item-hidden-mobile">
                  <Clock className="icon" />
                  <span>{t('header.hours')}</span>
                </div>
              </div>
              <div className="top-bar-right">
                {/* Language Switcher */}
                <div className="language-switcher">
                  <Globe className="icon" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                    className="language-select"
                  >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                  </select>
                </div>
                <div className="top-bar-item">
                  <Phone className="icon" />
                  <span className="font-medium">+237 6XX XXX XXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="main-header">
          <div className="container">
            <div className="main-header-content">
              {/* Logo */}
              <div 
                className="logo-section"
                onClick={() => navigate('/')}
              >
                <div className="logo-container">
                  <div className="logo-icon">
                    <Car className="car-icon" />
                  </div>
                  <div className="logo-pulse"></div>
                </div>
                <div className="logo-text">
                  <h1 className="brand-name">AUTO-BUSINESS</h1>
                  <p className="tagline">{t('header.tagline')}</p>
                </div>
              </div>

              {/* Search bar - Desktop only */}
              {!isAdminPage && (
                <div className="search-container-desktop">
                  <div className="search-wrapper">
                    <div className="search-icon-container">
                      <Search className="search-icon" />
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
                      className="search-input"
                    />
                    
                    {isSearchFocused && searchQuery.length > 0 && (
                      <div className="search-suggestions">
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
                              className="search-suggestion-item"
                            >
                              <Search className="suggestion-icon" />
                              <span>{suggestion}</span>
                            </button>
                          ))}
                      </div>
                    )}

                    <button
                      onClick={(e) => handleSearch(e)}
                      disabled={!searchQuery.trim()}
                      className={`search-button ${!searchQuery.trim() ? 'search-button-disabled' : ''}`}
                    >
                      {t('header.search.button')}
                    </button>
                  </div>
                </div>
              )}

              {/* Cart and Menu */}
              <div className="header-actions">
                {!isAdminPage && (
                  <button
                    onClick={onCartClick}
                    className="cart-button"
                    aria-label={`Panier avec ${totalItems} articles`}
                  >
                    <ShoppingCart className="cart-icon" />
                    {totalItems > 0 && (
                      <span className="cart-badge">
                        {totalItems}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="mobile-menu-button"
                >
                  <div className="menu-icon-container">
                    <Menu className={`menu-icon ${isMenuOpen ? 'menu-icon-hidden' : ''}`} />
                    <X className={`close-icon ${isMenuOpen ? '' : 'close-icon-hidden'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Search bar - Mobile */}
            {!isAdminPage && (
              <div className="search-container-mobile">
                <div className="search-wrapper-mobile">
                  <div className="search-icon-container-mobile">
                    <Search className="search-icon-mobile" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('header.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="search-input-mobile"
                  />
                  <button
                    onClick={(e) => handleSearch(e)}
                    disabled={!searchQuery.trim()}
                    className={`search-button-mobile ${!searchQuery.trim() ? 'search-button-mobile-disabled' : ''}`}
                  >
                    <Search className="search-button-icon-mobile" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!isAdminPage && (
          <nav className={`navigation ${isMenuOpen ? 'navigation-open' : ''}`}>
            <div className="container">
              <div className="nav-desktop">
                <div className="nav-left">
                  <button
                    ref={categoriesButtonRef}
                    onClick={() => setShowCategories(!showCategories)}
                    className="categories-button"
                  >
                    <Menu className="categories-icon" />
                    <span>{t('header.categories')}</span>
                    <ChevronDown className={`chevron-icon ${showCategories ? 'chevron-rotated' : ''}`} />
                  </button>

                  <div className="nav-categories">
                    {categories.slice(2, 6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="nav-category-item"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="nav-right">
                  <span className="stock-indicator">●</span>
                  <span className="stock-text">{t('header.stock')}</span>
                </div>
              </div>

              <div className="nav-mobile">
                <div className="mobile-categories">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="mobile-category-item"
                    >
                      <div className="mobile-category-name">{category.name}</div>
                      <div className="mobile-category-view">{t('products.view')} →</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Categories Dropdown */}
      {showCategories && !isAdminPage && (
        <>
          {/* Backdrop */}
          <div
            className="dropdown-backdrop"
            onClick={() => setShowCategories(false)}
          />
          
          {/* Dropdown */}
          <div
            ref={categoriesDropdownRef}
            className="categories-dropdown"
          >
            <div className="container">
              <div className="dropdown-content">
                <div className="dropdown-categories">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="dropdown-category-item"
                    >
                      <div className="dropdown-category-name">
                        {category.name}
                      </div>
                      <div className="dropdown-category-view">{t('products.view')} →</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
