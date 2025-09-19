import React, { useState, useCallback } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import '../components styles/ProductCard.css';

const ProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}> = ({ product, onViewDetails, viewMode = 'grid' }) => {
  const { dispatch } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAddingToCart) return; // Prevent double clicks
    
    setIsAddingToCart(true);
    dispatch({ type: 'ADD_ITEM', payload: product });
    
    // Add visual feedback
    const button = e.currentTarget as HTMLElement;
    button.classList.add('animate-pulse');
    
    // Reset after animation
    setTimeout(() => {
      button.classList.remove('animate-pulse');
      setIsAddingToCart(false);
    }, 200);
  }, [dispatch, product, isAddingToCart]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(product);
  }, [onViewDetails, product]);

  const handleCardClick = useCallback(() => {
    onViewDetails(product);
  }, [onViewDetails, product]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Get appropriate image source with fallback
  const getImageSrc = useCallback(() => {
    if (imageError) {
      return viewMode === 'list' ? '/api/placeholder/300/200' : '/api/placeholder/300/300';
    }
    return product.images[0];
  }, [imageError, product.images, viewMode]);

  if (viewMode === 'list') {
    return (
      <article 
        className="product-card product-card--list"
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Voir les détails de ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="product-card__image-container product-card__image-container--list">
          <img
            src={getImageSrc()}
            alt={product.name}
            onError={handleImageError}
            className="product-card__image"
            loading="lazy"
          />
          <div className="product-card__actions">
            <button
              onClick={toggleFavorite}
              className={`product-card__favorite-btn ${
                isFavorite 
                  ? 'product-card__favorite-btn--active' 
                  : 'product-card__favorite-btn--inactive'
              }`}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              type="button"
            >
              <Heart 
                className={`product-card__favorite-icon ${
                  isFavorite ? 'product-card__favorite-icon--filled' : ''
                }`} 
                aria-hidden="true"
              />
            </button>
          </div>
          {product.warranty && (
            <div 
              className="product-card__warranty-badge product-card__warranty-badge--list"
              role="badge"
              aria-label={`Garantie ${product.warranty}`}
            >
              Garantie {product.warranty}
            </div>
          )}
        </div>
        
        <div className="product-card__content product-card__content--list">
          <div>
            <header className="product-card__header product-card__header--list">
              <h3 className="product-card__title product-card__title--list">
                {product.name}
              </h3>
              <span 
                className="product-card__category product-card__category--list"
                role="badge"
              >
                {product.category}
              </span>
            </header>
            <p className="product-card__description">
              {product.description}
            </p>
          </div>
          
          <div className="product-card__buttons product-card__buttons--list">
            <div 
              className="product-card__price product-card__price--list"
              aria-label={`Prix: ${formatPrice(product.price)}`}
            >
              {formatPrice(product.price)}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleViewDetails}
                className="product-card__btn product-card__btn--secondary product-card__btn--list"
                aria-label={`Voir les détails de ${product.name}`}
                type="button"
              >
                <Eye className="product-card__btn-icon product-card__btn-icon--list" aria-hidden="true" />
                Détails
              </button>
              <button
                onClick={handleAddToCart}
                className="product-card__btn product-card__btn--primary product-card__btn--list"
                aria-label={`Ajouter ${product.name} au panier`}
                disabled={isAddingToCart}
                type="button"
              >
                <ShoppingCart className="product-card__btn-icon product-card__btn-icon--list" aria-hidden="true" />
                {isAddingToCart ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="product-card"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Voir les détails de ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="product-card__image-container product-card__image-container--grid">
        <img
          src={getImageSrc()}
          alt={product.name}
          onError={handleImageError}
          className={`product-card__image ${
            isHovered ? 'product-card__image--hovered' : ''
          }`}
          loading="lazy"
        />
        
        <div className="product-card__actions">
          <button
            onClick={toggleFavorite}
            className={`product-card__favorite-btn ${
              isFavorite 
                ? 'product-card__favorite-btn--active' 
                : 'product-card__favorite-btn--inactive'
            }`}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            type="button"
          >
            <Heart 
              className={`product-card__favorite-icon ${
                isFavorite ? 'product-card__favorite-icon--filled' : ''
              }`} 
              aria-hidden="true"
            />
          </button>
        </div>

        {product.warranty && (
          <div 
            className="product-card__warranty-badge"
            role="badge"
            aria-label={`Garantie ${product.warranty}`}
          >
            Garantie {product.warranty}
          </div>
        )}

        <div className={`product-card__overlay ${
          isHovered ? 'product-card__overlay--visible' : ''
        }`} />
      </div>

      <div className="product-card__content product-card__content--grid">
        <header className="product-card__header">
          <h3 className="product-card__title product-card__title--grid">
            {product.name}
          </h3>
          <span 
            className="product-card__category product-card__category--grid"
            role="badge"
          >
            {product.category}
          </span>
        </header>

        <div 
          className="product-card__price product-card__price--grid"
          aria-label={`Prix: ${formatPrice(product.price)}`}
        >
          {formatPrice(product.price)}
        </div>

        <div className="product-card__buttons product-card__buttons--grid">
          <button
            onClick={handleViewDetails}
            className="product-card__btn product-card__btn--secondary product-card__btn--grid"
            aria-label={`Voir les détails de ${product.name}`}
            type="button"
          >
            <Eye className="product-card__btn-icon product-card__btn-icon--grid" aria-hidden="true" />
            Détails
          </button>
          <button
            onClick={handleAddToCart}
            className="product-card__btn product-card__btn--primary product-card__btn--grid"
            aria-label={`Ajouter ${product.name} au panier`}
            disabled={isAddingToCart}
            type="button"
          >
            <ShoppingCart className="product-card__btn-icon product-card__btn-icon--grid" aria-hidden="true" />
            {isAddingToCart ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;