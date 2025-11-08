import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';
import OrderConfirmation from './OrderConfirmation';
import '../components styles/Cart.css';

const Cart: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isSubmittingToCheckout, setIsSubmittingToCheckout] = useState(false);
  
  // Refs for accessibility and focus management
  const cartPanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus close button after animation
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 300);
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset states when cart closes
  useEffect(() => {
    if (!isOpen) {
      setShowCheckout(false);
      setShowConfirmation(false);
      setOrderData(null);
      setIsSubmittingToCheckout(false);
    }
  }, [isOpen]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  }, [dispatch]);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, [dispatch]);

  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const getImageSrc = useCallback((productId: string, imageUrl: string) => {
    return imageErrors[productId] ? '/api/placeholder/400/400' : imageUrl;
  }, [imageErrors]);

  const handleCheckoutSubmit = useCallback((submittedOrderData: any) => {
    console.log('Order submitted:', submittedOrderData);
    setOrderData(submittedOrderData);
    setShowCheckout(false);
    setShowConfirmation(true);
    // Clear the cart after successful order
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch]);

  const handleOrderConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    setOrderData(null);
    onClose(); // Close the cart as well
  }, [onClose]);

  const handleCheckoutClick = useCallback(async () => {
    console.log('Checkout button clicked, current items:', state.items);
    
    if (state.items.length === 0) {
      // Focus on continue shopping or close button
      closeButtonRef.current?.focus();
      return;
    }

    setIsSubmittingToCheckout(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      setShowCheckout(true);
      setIsSubmittingToCheckout(false);
    }, 200);
  }, [state.items]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleQuantityButtonClick = useCallback((productId: string, newQuantity: number, operation: 'increase' | 'decrease') => {
    updateQuantity(productId, newQuantity);
    
    // Announce quantity change for screen readers
    const announcement = operation === 'increase' 
      ? `Quantité augmentée à ${newQuantity}`
      : `Quantité diminuée à ${newQuantity}`;
    
    // Create temporary announcement element
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, [updateQuantity]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={handleOverlayClick}>
        <aside 
          ref={cartPanelRef}
          className="cart-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
        >
          {/* Header */}
          <header className="cart-header">
            <h2 id="cart-title" className="cart-title">
              <ShoppingCart className="cart-title-icon" aria-hidden="true" />
              Mon panier ({totalItems})
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="cart-close-button"
              aria-label="Fermer le panier"
              type="button"
            >
              <X className="cart-close-icon" />
            </button>
          </header>

          <div className="cart-content">
            {state.items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-content">
                  <div className="cart-empty-icon-wrapper">
                    <ShoppingCart className="cart-empty-icon" aria-hidden="true" />
                  </div>
                  <h3 className="cart-empty-title">Votre panier est vide</h3>
                  <p className="cart-empty-description">
                    Ajoutez des produits pour commencer vos achats
                  </p>
                  <button
                    onClick={onClose}
                    className="cart-continue-button"
                    type="button"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="cart-items-container">
                  <ul className="cart-items-list" role="list" aria-label="Articles dans le panier">
                    {state.items.map((item) => (
                      <li key={item.product.id} className="cart-item">
                        <div className="cart-item-info">
                          <div className="cart-item-image">
                            <img
                              src={getImageSrc(item.product.id, item.product.images[0])}
                              alt={item.product.name}
                              onError={() => handleImageError(item.product.id)}
                              className="cart-item-img"
                              loading="lazy"
                            />
                          </div>
                          
                          <div className="cart-item-details">
                            <h3 className="cart-item-name">{item.product.name}</h3>
                            <p className="cart-item-category">{item.product.category}</p>
                            <p className="cart-item-price" aria-label={`Prix unitaire: ${formatPrice(item.product.price)}`}>
                              {formatPrice(item.product.price)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-controls" role="group" aria-label="Contrôles de quantité">
                            <button
                              onClick={() => handleQuantityButtonClick(
                                item.product.id, 
                                item.quantity - 1, 
                                'decrease'
                              )}
                              className="quantity-button"
                              aria-label={`Diminuer la quantité de ${item.product.name}`}
                              type="button"
                            >
                              <Minus className="quantity-icon" aria-hidden="true" />
                            </button>
                            
                            <span 
                              className="quantity-display"
                              aria-label={`Quantité: ${item.quantity}`}
                            >
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityButtonClick(
                                item.product.id, 
                                item.quantity + 1, 
                                'increase'
                              )}
                              className="quantity-button"
                              aria-label={`Augmenter la quantité de ${item.product.name}`}
                              type="button"
                            >
                              <Plus className="quantity-icon" aria-hidden="true" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="remove-button"
                            aria-label={`Supprimer ${item.product.name} du panier`}
                            type="button"
                          >
                            <Trash2 className="remove-icon" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fixed Bottom Section - Always visible */}
                <footer className="cart-footer">
                  <div className="cart-footer-content">
                    <div className="cart-total-row">
                      <span className="cart-total-label">Total:</span>
                      <span 
                        className="cart-total-amount"
                        aria-label={`Total de la commande: ${formatPrice(state.total)}`}
                      >
                        {formatPrice(state.total)}
                      </span>
                    </div>
                    
                    <div className="cart-benefits" role="region" aria-label="Avantages">
                      <div className="cart-benefits-content">
                        <span>✓ Livraison gratuite</span>
                        <span className="cart-benefits-separator" aria-hidden="true">•</span>
                        <span>✓ Paiement à la livraison</span>
                      </div>
                    </div>

                    <button
                      ref={checkoutButtonRef}
                      onClick={handleCheckoutClick}
                      className="cart-checkout-button"
                      disabled={isSubmittingToCheckout}
                      aria-describedby="cart-benefits"
                      type="button"
                    >
                      {isSubmittingToCheckout ? 'Préparation...' : 'Passer votre commande'}
                    </button>
                  </div>
                </footer>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Checkout Form Modal */}
      {showCheckout && (
        <CheckoutForm
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckoutSubmit}
        />
      )}

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <OrderConfirmation
          isOpen={showConfirmation}
          onClose={handleOrderConfirmationClose}
          orderData={orderData}
        />
      )}
    </>
  );
};

export default Cart;