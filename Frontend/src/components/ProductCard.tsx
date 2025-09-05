import React, { useState } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import '../components styles/ProductCard.css';

const ProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}> = ({ product, onViewDetails, viewMode = 'grid' }) => {
  const { dispatch } = useCart();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
    
    // Add visual feedback
    const button = e.currentTarget as HTMLElement;
    button.classList.add('animate-pulse');
    setTimeout(() => button.classList.remove('animate-pulse'), 200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`product-card product-card--list`}
        onClick={() => onViewDetails(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-card__image-container product-card__image-container--list">
          <img
            src={imageError ? '/api/placeholder/300/200' : product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            className="product-card__image"
          />
          <div className="product-card__actions">
            <button
              onClick={toggleFavorite}
              className={`product-card__favorite-btn ${
                isFavorite 
                  ? 'product-card__favorite-btn--active' 
                  : 'product-card__favorite-btn--inactive'
              }`}
            >
              <Heart className={`product-card__favorite-icon ${isFavorite ? 'product-card__favorite-icon--filled' : ''}`} />
            </button>
          </div>
          {product.warranty && (
            <div className="product-card__warranty-badge product-card__warranty-badge--list">
              Garantie {product.warranty}
            </div>
          )}
        </div>
        
        <div className="product-card__content product-card__content--list">
          <div>
            <div className="product-card__header product-card__header--list">
              <h3 className="product-card__title product-card__title--list">{product.name}</h3>
              <span className="product-card__category product-card__category--list">
                {product.category}
              </span>
            </div>
            <p className="product-card__description">{product.description}</p>
          </div>
          
          <div className="product-card__buttons product-card__buttons--list">
            <div className="product-card__price product-card__price--list">
              {formatPrice(product.price)}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                className="product-card__btn product-card__btn--secondary product-card__btn--list"
              >
                <Eye className="product-card__btn-icon product-card__btn-icon--list" />
                {t('products.details')}
              </button>
              <button
                onClick={handleAddToCart}
                className="product-card__btn product-card__btn--primary product-card__btn--list"
              >
                <ShoppingCart className="product-card__btn-icon product-card__btn-icon--list" />
                {t('products.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="product-card"
      onClick={() => onViewDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-card__image-container product-card__image-container--grid">
        <img
          src={imageError ? '/api/placeholder/300/300' : product.images[0]}
          alt={product.name}
          onError={() => setImageError(true)}
          className={`product-card__image ${
            isHovered ? 'product-card__image--hovered' : ''
          }`}
        />
        
        <div className="product-card__actions">
          <button
            onClick={toggleFavorite}
            className={`product-card__favorite-btn ${
              isFavorite 
                ? 'product-card__favorite-btn--active' 
                : 'product-card__favorite-btn--inactive'
            }`}
          >
            <Heart className={`product-card__favorite-icon ${isFavorite ? 'product-card__favorite-icon--filled' : ''}`} />
          </button>
        </div>

        {product.warranty && (
          <div className="product-card__warranty-badge">
            {t('products.warranty')} {product.warranty}
          </div>
        )}

        <div className={`product-card__overlay ${
          isHovered ? 'product-card__overlay--visible' : ''
        }`} />
      </div>

      <div className="product-card__content product-card__content--grid">
        <div className="product-card__header">
          <h3 className="product-card__title product-card__title--grid">{product.name}</h3>
          <span className="product-card__category product-card__category--grid">
            {product.category}
          </span>
        </div>

        <div className="product-card__price product-card__price--grid">
          {formatPrice(product.price)}
        </div>

        <div className="product-card__buttons product-card__buttons--grid">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="product-card__btn product-card__btn--secondary product-card__btn--grid"
          >
            <Eye className="product-card__btn-icon product-card__btn-icon--grid" />
            {t('products.details')}
          </button>
          <button
            onClick={handleAddToCart}
            className="product-card__btn product-card__btn--primary product-card__btn--grid"
          >
            <ShoppingCart className="product-card__btn-icon product-card__btn-icon--grid" />
            {t('products.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;