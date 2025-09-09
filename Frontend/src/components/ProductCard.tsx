import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import '../components styles/ProductCard.css';

// Translation wrapper component for backend content
const TranslatableText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  element?: 'span' | 'h3' | 'p' | 'div';
}> = ({ children, className = '', element = 'span' }) => {
  const Element = element;
  
  return (
    <Element 
      className={`${className} notranslate-temp`}
      data-translate="true"
      suppressHydrationWarning
    >
      {children}
    </Element>
  );
};

const ProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}> = ({ product, onViewDetails, viewMode = 'grid' }) => {
  const { dispatch } = useCart();
  const { t, language } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Force Google Translate to re-scan when language changes or product data updates
  useEffect(() => {
    const triggerTranslation = () => {
      // Remove temporary notranslate class to allow translation
      const elements = document.querySelectorAll('.notranslate-temp');
      elements.forEach(el => {
        el.classList.remove('notranslate-temp');
        if (language === 'en') {
          el.classList.add('translate-content');
        } else {
          el.classList.remove('translate-content');
        }
      });

      // Trigger Google Translate re-scan for new content
      if (window.google && window.google.translate) {
        setTimeout(() => {
          const googleSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
          if (googleSelect) {
            // Force re-translation by toggling language
            const currentValue = googleSelect.value;
            const targetValue = language === 'en' ? 'en' : 'fr';
            
            if (currentValue !== targetValue) {
              googleSelect.value = targetValue;
              googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }, 100);
      }
    };

    triggerTranslation();
  }, [product, language]);

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
              <TranslatableText>{t('products.warranty')} {product.warranty}</TranslatableText>
            </div>
          )}
        </div>
        
        <div className="product-card__content product-card__content--list">
          <div>
            <div className="product-card__header product-card__header--list">
              <TranslatableText 
                element="h3" 
                className="product-card__title product-card__title--list"
              >
                {product.name}
              </TranslatableText>
              <TranslatableText className="product-card__category product-card__category--list">
                {product.category}
              </TranslatableText>
            </div>
            <TranslatableText 
              element="p" 
              className="product-card__description"
            >
              {product.description}
            </TranslatableText>
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
            <TranslatableText>{t('products.warranty')} {product.warranty}</TranslatableText>
          </div>
        )}

        <div className={`product-card__overlay ${
          isHovered ? 'product-card__overlay--visible' : ''
        }`} />
      </div>

      <div className="product-card__content product-card__content--grid">
        <div className="product-card__header">
          <TranslatableText 
            element="h3" 
            className="product-card__title product-card__title--grid"
          >
            {product.name}
          </TranslatableText>
          <TranslatableText className="product-card__category product-card__category--grid">
            {product.category}
          </TranslatableText>
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