import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const { dispatch } = useCart();

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
            <h2 className="modal-title">Détails du produit</h2>
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
                  <h1 className="product-title">{product.name}</h1>
                  
                  <div className="product-meta">
                    <span className="category-badge">
                      {product.category}
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
                    🛡️ Garantie {product.warranty}
                  </div>
                  <div className="stock-badge">
                    ⚡ En stock
                  </div>
                </div>

                <div className="description-section">
                  <h3 className="description-title">Description</h3>
                  <p className="description-text">{product.description}</p>
                </div>

                <div className="actions-section">
                  <button onClick={handleAddToCart} className="add-to-cart-button">
                    <ShoppingCart className="cart-icon" />
                    Ajouter au panier
                  </button>

                  <div className="delivery-info">
                    <h4 className="delivery-title">
                      <span className="delivery-icon">🚛</span>
                      Livraison gratuite
                    </h4>
                    <ul className="delivery-list">
                      <li>✓ Livraison gratuite à Yaoundé</li>
                      <li>✓ Expédition dans tout le Cameroun</li>
                      <li>✓ Paiement à la livraison disponible</li>
                      <li>✓ Support client 7j/7</li>
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