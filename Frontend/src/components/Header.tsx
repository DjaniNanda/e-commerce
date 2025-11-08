import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Menu, X, MapPin, Clock, Phone, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import '../components styles/Header.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onCategoryClick?: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch = () => {},
  onCartClick = () => {},
  onCategoryClick = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { state } = useCart();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Enhanced responsive detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMenuOpen]);

  // Enhanced search handler
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
      setIsSearchFocused(false);
    } else {
      onSearch('');
    }
    
    // Close mobile menu after search
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [searchQuery, onSearch, isMobile, isMenuOpen]);

  // Enhanced category click handler
  const handleCategoryClick = useCallback((categoryId: string) => {
    onCategoryClick(categoryId);
    setIsMenuOpen(false);
    setShowCategories(false);
  }, [onCategoryClick]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setShowCategories(false);
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  }, [handleSearch, isMobile]);

  // Focus management for accessibility
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setIsSearchFocused(false), 200);
  }, []);

  // Enhanced suggestion handling
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setIsSearchFocused(false);
  }, [onSearch]);

  const searchSuggestions = [
    'Plaquette de frein',
    'Filtre à huile',
    'Amortisseur',
    'Pneus',
    'Batterie',
    'Bougies',
    'Courroie de distribution',
    'Radiateur'
  ];

  const isAdminPage = location.pathname === '/admin';

  // Filter suggestions based on search query
  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && suggestion.toLowerCase() !== searchQuery.toLowerCase()
  );

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
                  <span className="topbar-text">Livraison gratuite à Yaoundé</span>
                </div>
                <div className="topbar-item topbar-item-hidden-mobile">
                  <Clock className="topbar-icon" />
                  <span>Ouvert 8h00-18h30</span>
                </div>
              </div>
              <div className="topbar-right">
                <div className="topbar-item">
                  <Phone className="topbar-icon" />
                  <a href="tel:+237699849474" className="topbar-phone hover:text-blue-200 transition-colors">
                    +237 699 849 474
                  </a>
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/');
                  }
                }}
                aria-label="Aller à l'accueil"
              >
                <div className="logo-container">
                  <div className="logo-icon-wrapper">
                    <img 
                      src="/android-chrome-192x192.png" 
                      alt="AUTO-BUSINESS Logo" 
                      className="logo-icon logo-image"
                    />
                  </div>
                  <div className="logo-accent"></div>
                </div>
                <div className="logo-text-container">
                  <h1 className="logo-title">
                    AUTO-BUSINESS 237
                  </h1>
                  <div className="brand-logos">
                    <img 
                      src="/mercedes.jpeg" 
                      alt="Mercedes" 
                      className="brand-logo"
                      title="Mercedes-Benz"
                    />
                    <img 
                      src="/toyota.jpeg" 
                      alt="Toyota" 
                      className="brand-logo"
                      title="Toyota"
                    />
                    <img 
                      src="/hyundai.jpeg" 
                      alt="Hyundai" 
                      className="brand-logo"
                      title="Hyundai"
                    />
                    <img 
                      src="/kia.jpeg" 
                      alt="Kia" 
                      className="brand-logo"
                      title="Kia"
                    />
                  </div>
                </div>
              </div>

              {/* Search bar - Desktop only */}
              {!isAdminPage && (
                <div className="search-desktop">
                  <form onSubmit={handleSearch} className="search-container">
                    <div className="search-icon-wrapper">
                      <Search className="search-icon" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher des pièces auto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      onKeyDown={handleKeyDown}
                      className="search-input"
                      autoComplete="off"
                      aria-label="Rechercher des pièces automobiles"
                      aria-expanded={isSearchFocused && filteredSuggestions.length > 0}
                      aria-haspopup="listbox"
                    />
                    
                    {isSearchFocused && filteredSuggestions.length > 0 && (
                      <div 
                        className="search-suggestions"
                        role="listbox"
                        aria-label="Suggestions de recherche"
                      >
                        {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="search-suggestion-item"
                            role="option"
                            aria-selected="false"
                          >
                            <Search className="suggestion-icon" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="search-button"
                      aria-label="Lancer la recherche"
                    >
                      Rechercher
                    </button>
                  </form>
                </div>
              )}

              {/* Cart and Menu */}
              <div className="header-actions">
                {!isAdminPage && (
                  <button
                    onClick={onCartClick}
                    className="cart-button"
                    aria-label={`Panier avec ${totalItems} article${totalItems !== 1 ? 's' : ''}`}
                  >
                    <ShoppingCart className="cart-icon" />
                    {totalItems > 0 && (
                      <span className="cart-badge" aria-hidden="true">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="mobile-menu-button"
                  aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                  aria-expanded={isMenuOpen}
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
                <form onSubmit={handleSearch} className="search-mobile-container">
                  <div className="search-mobile-icon-wrapper">
                    <Search className="search-mobile-icon" />
                  </div>
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Rechercher des pièces auto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="search-mobile-input"
                    autoComplete="off"
                    aria-label="Rechercher des pièces automobiles"
                  />
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="search-mobile-button"
                    aria-label="Lancer la recherche"
                  >
                    <Search className="search-mobile-button-icon" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!isAdminPage && (
          <nav 
            className={`navigation ${isMenuOpen ? 'navigation-open' : 'navigation-closed'}`}
            aria-label="Navigation principale"
          >
            <div className="container">
              <div className="nav-desktop">
                <div className="nav-left">
                  <button
                    ref={categoriesButtonRef}
                    onClick={() => setShowCategories(!showCategories)}
                    className="categories-button"
                    aria-expanded={showCategories}
                    aria-haspopup="true"
                    aria-label="Toutes les catégories"
                  >
                    <Menu className="categories-button-icon" />
                    <span>Toutes les catégories</span>
                    <ChevronDown className={`categories-chevron ${showCategories ? 'categories-chevron-rotated' : ''}`} />
                  </button>

                  <div className="nav-categories">
                    {categories.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="nav-category-button"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="nav-stock-indicator">
                  <span className="stock-dot" aria-hidden="true">●</span>
                  <span className="stock-text">Plus de 10 000 pièces en stock</span>
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
                        {category.name}
                      </div>
                      <div className="mobile-category-action">Voir →</div>
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
            aria-hidden="true"
          />
          
          <div
            ref={categoriesDropdownRef}
            className="categories-dropdown"
            role="menu"
            aria-label="Menu des catégories"
          >
            <div className="container">
              <div className="categories-grid">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="category-dropdown-item"
                    role="menuitem"
                  >
                    <div className="category-dropdown-name">
                      {category.name}
                    </div>
                    <div className="category-dropdown-action">Voir →</div>
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