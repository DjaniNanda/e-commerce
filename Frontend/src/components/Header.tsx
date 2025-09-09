import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Car, MapPin, Clock, Phone, ChevronDown, Globe } from 'lucide-react';
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
      <header className="header-main">
        {/* Top bar */}
        <div className="header-topbar">
          <div className="container">
            <div className="topbar-content">
              <div className="topbar-left">
                <div className="topbar-item">
                  <MapPin className="topbar-icon topbar-icon-pulse" />
                  <span className="topbar-text">{t('header.delivery')}</span>
                </div>
                <div className="topbar-item topbar-item-hidden-mobile">
                  <Clock className="topbar-icon" />
                  <span>{t('header.hours')}</span>
                </div>
              </div>
              <div className="topbar-right">
                {/* Language Switcher */}
                <div className="topbar-item">
                  <Globe className="topbar-icon" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                    className="language-select"
                  >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                  </select>
                </div>
                <div className="topbar-item">
                  <Phone className="topbar-icon" />
                  <span className="topbar-phone">+237 6XX XXX XXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="header-content">
          <div className="container">
            <div className="header-inner">
              {/* Logo */}
              <div 
                className="logo-section"
                onClick={() => navigate('/')}
              >
                <div className="logo-container">
                  <div className="logo-icon-wrapper">
                    <Car className="logo-icon" />
                  </div>
                  <div className="logo-accent"></div>
                </div>
                <div>
                  <h1 className="logo-title">
                    AUTO-BUSINESS
                  </h1>
                  <p className="logo-tagline">{t('header.tagline')}</p>
                </div>
              </div>

              {/* Search bar - Desktop only */}
              {!isAdminPage && (
                <div className="search-desktop">
                  <div className="search-container">
                    <div className="search-icon-wrapper">
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
                      className="search-button"
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
                    <Menu className={`menu-icon ${isMenuOpen ? 'menu-icon-hidden' : 'menu-icon-visible'}`} />
                    <X className={`close-icon ${isMenuOpen ? 'close-icon-visible' : 'close-icon-hidden'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            {!isAdminPage && (
              <div className="search-mobile">
                <div className="search-mobile-container">
                  <div className="search-mobile-icon-wrapper">
                    <Search className="search-mobile-icon" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('header.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="search-mobile-input"
                  />
                  <button
                    onClick={(e) => handleSearch(e)}
                    disabled={!searchQuery.trim()}
                    className="search-mobile-button"
                  >
                    <Search className="search-mobile-button-icon" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!isAdminPage && (
          <nav className={`navigation ${isMenuOpen ? 'navigation-open' : 'navigation-closed'}`}>
            <div className="container">
              <div className="nav-desktop">
                <div className="nav-left">
                  <button
                    ref={categoriesButtonRef}
                    onClick={() => setShowCategories(!showCategories)}
                    className="categories-button"
                  >
                    <Menu className="categories-button-icon" />
                    <span>{t('header.categories')}</span>
                    <ChevronDown className={`categories-chevron ${showCategories ? 'categories-chevron-rotated' : ''}`} />
                  </button>

                  <div className="nav-categories">
                    {categories.slice(2, 6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="nav-category-button"
                      >
                        {/* This will be translated by Google Translate if it comes from backend */}
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="nav-stock-indicator">
                  <span className="stock-dot">●</span>
                  <span className="stock-text">{t('header.stock')}</span>
                </div>
              </div>

              <div className="nav-mobile">
                <div className="mobile-categories">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="mobile-category-button"
                    >
                      <div className="mobile-category-name">
                        {/* Backend category names will be automatically translated */}
                        {category.name}
                      </div>
                      <div className="mobile-category-action">{t('products.view')} →</div>
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
          <div
            className="categories-backdrop"
            onClick={() => setShowCategories(false)}
          />
          
          <div
            ref={categoriesDropdownRef}
            className="categories-dropdown"
          >
            <div className="container">
              <div className="categories-grid">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="category-dropdown-item"
                  >
                    <div className="category-dropdown-name">
                      {/* Backend data - will be automatically translated by Google */}
                      {category.name}
                    </div>
                    <div className="category-dropdown-action">{t('products.view')} →</div>
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