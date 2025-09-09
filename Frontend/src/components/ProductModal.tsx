import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import '../components styles/ProductModal.css';

// Translation wrapper component for backend content
const TranslatableText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  element?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'li';
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

const ProductModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { dispatch } = useCart();
  const { t, language } = useTranslation();

  // Force Google Translate to re-scan when modal opens or language changes
  useEffect(() => {
    if (!isOpen) return;

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

      // Trigger Google Translate re-scan for modal content
      if (window.google && window.google.translate) {
        setTimeout(() => {
          const googleSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
          if (googleSelect) {
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

    // Delay to ensure modal is fully rendered
    const timeoutId = setTimeout(triggerTranslation, 200);
    
    return () => clearTimeout(timeoutId);
  }, [isOpen, product, language]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">{t('products.details')}</h2>
            <button onClick={onClose} className="close-button">
              <X className="close-icon" />
            </button>
          </div>

          <div className="modal-content">
            <div className="modal-grid">
              {/* Images Section */}
              <div className="images-section">
                <div className="main-image-container">
                  <div className="main-image-wrapper">
                    <img
                      src={imageError ? '/api/placeholder/400/400' : product.images[currentImageIndex]}
                      alt={product.name}
                      onError={() => setImageError(true)}
                      className="main-image"
                    />
                  </div>
                  
                  {product.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="nav-button nav-button-left">
                        <ChevronLeft className="nav-icon" />
                      </button>
                      <button onClick={nextImage} className="nav-button nav-button-right">
                        <ChevronRight className="nav-icon" />
                      </button>
                    </>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="thumbnails-container">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`thumbnail ${
                          index === currentImageIndex ? 'thumbnail-active' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="thumbnail-image"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="product-info">
                <div>
                  <TranslatableText 
                    element="h1" 
                    className="product-title"
                  >
                    {product.name}
                  </TranslatableText>
                  
                  <div className="product-meta">
                    <span className="category-badge">
                      <TranslatableText>
                        {product.category}
                      </TranslatableText>
                    </span>
                  </div>
                </div>

                <div className="price-section">
                  <div className="price-amount">
                    {formatPrice(product.price)}
                  </div>
                  <p className="price-subtitle">Prix tout compris, livraison gratuite</p>
                </div>

                <div className="badges-container">
                  <div className="warranty-badge">
                    🛡️ <TranslatableText>{t('products.warranty')} {product.warranty}</TranslatableText>
                  </div>
                  <div className="stock-badge">
                    ⚡ En stock
                  </div>
                </div>

                <div className="description-section">
                  <h3 className="description-title">Description</h3>
                  <TranslatableText 
                    element="p" 
                    className="description-text"
                  >
                    {product.description}
                  </TranslatableText>
                </div>

                <div className="actions-section">
                  <button onClick={handleAddToCart} className="add-to-cart-button">
                    <ShoppingCart className="cart-icon" />
                    {t('products.add')} au panier
                  </button>

                  <div className="delivery-info">
                    <h4 className="delivery-title">
                      <span className="delivery-icon">🚛</span>
                      {t('cart.free.delivery')}
                    </h4>
                    <ul className="delivery-list">
                      <TranslatableText element="li">✓ Livraison gratuite à Yaoundé</TranslatableText>
                      <TranslatableText element="li">✓ Expédition dans tout le Cameroun</TranslatableText>
                      <TranslatableText element="li">✓ Paiement à la livraison disponible</TranslatableText>
                      <TranslatableText element="li">✓ Support client 7j/7</TranslatableText>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductModal;