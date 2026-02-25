import React, { useState, useEffect, useCallback } from 'react';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import '../components styles/ProductModal.css';

const ProductModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<boolean[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { dispatch } = useCart();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setImageError([]);
      setTouchStart(null);
      setTouchEnd(null);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const nextImage = useCallback(() => {
    if (product.images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  }, [product.images.length]);

  const prevImage = useCallback(() => {
    if (product.images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  }, [product.images.length]);

  const handleImageError = (index: number) => {
    setImageError(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && product.images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && product.images.length > 1) {
      prevImage();
    }
  };

  // Handle modal overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getImageSrc = (index: number) => {
    return imageError[index] ? '/api/placeholder/400/400' : product.images[index];
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Header */}
        <header className="modal-header">
          <h2 className="modal-title">Détails du produit</h2>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Fermer la modal"
            type="button"
          >
            <X className="close-icon" />
          </button>
        </header>

        <div className="modal-content">
          <div className="modal-grid">
            {/* Images Section */}
            <section className="images-section" aria-label="Images du produit">
              <div className="main-image-container">
                <div 
                  className="main-image-wrapper"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={getImageSrc(currentImageIndex)}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    onError={() => handleImageError(currentImageIndex)}
                    className="main-image"
                    loading="eager"
                  />
                </div>
                
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className="nav-button nav-button-left"
                      aria-label="Image précédente"
                      type="button"
                    >
                      <ChevronLeft className="nav-icon" />
                    </button>
                    <button 
                      onClick={nextImage} 
                      className="nav-button nav-button-right"
                      aria-label="Image suivante"
                      type="button"
                    >
                      <ChevronRight className="nav-icon" />
                    </button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="thumbnails-container" role="tablist" aria-label="Miniatures des images">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`thumbnail ${
                        index === currentImageIndex ? 'thumbnail-active' : ''
                      }`}
                      aria-label={`Voir l'image ${index + 1}`}
                      aria-selected={index === currentImageIndex}
                      role="tab"
                      type="button"
                    >
                      <img
                        src={getImageSrc(index)}
                        alt={`${product.name} miniature ${index + 1}`}
                        onError={() => handleImageError(index)}
                        className="thumbnail-image"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Product Info Section */}
            <section className="product-info" aria-label="Informations du produit">
              <div>
                <h1 className="product-title">
                  {product.name}
                </h1>
                
                <div className="product-meta">
                  <span className="category-badge" role="badge">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="price-section" role="region" aria-label="Prix">
                <div className="price-amount" aria-label={`Prix: ${formatPrice(product.price)}`}>
                  {formatPrice(product.price)}
                </div>
                <p className="price-subtitle">Prix tout compris, livraison gratuite</p>
              </div>

              <div className="badges-container" role="group" aria-label="Informations produit">
                <div className="warranty-badge" role="badge">
                  🛡️ Garantie {product.warranty}
                </div>
                <div className="stock-badge" role="badge">
                  ⚡ En stock
                </div>
              </div>

              <div className="description-section">
                <h3 className="description-title">Description</h3>
                <p className="description-text">
                  {product.description}
                </p>
              </div>

              <div className="actions-section">
                <button 
                  onClick={handleAddToCart} 
                  className="add-to-cart-button"
                  aria-label={`Ajouter ${product.name} au panier`}
                  type="button"
                >
                  <ShoppingCart className="cart-icon" aria-hidden="true" />
                  Ajouter au panier
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;