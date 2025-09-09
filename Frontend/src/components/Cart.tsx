import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import CheckoutForm from './CheckoutForm';
import OrderConfirmation from './OrderConfirmation';
import '../components styles/Cart.css';

const Cart: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const { t } = useTranslation();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleCheckoutSubmit = (submittedOrderData: any) => {
    console.log('Order submitted:', submittedOrderData);
    setOrderData(submittedOrderData);
    setShowCheckout(false);
    setShowConfirmation(true);
    // Clear the cart after successful order
    dispatch({ type: 'CLEAR_CART' });
  };

  const handleOrderConfirmationClose = () => {
    setShowConfirmation(false);
    setOrderData(null);
    onClose(); // Close the cart as well
  };

  const handleCheckoutClick = () => {
    console.log('Checkout button clicked, current items:', state.items);
    if (state.items.length === 0) {
      alert(t('cart.empty'));
      return;
    }
    setShowCheckout(true);
  };

   return (
    <>
      <div className="cart-overlay">
        <div className="cart-container">
          {/* Header */}
          <div className="cart-header">
            <h2 className="cart-title">
              <ShoppingCart className="cart-title-icon" />
              {t('cart.title')} ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="cart-close-button"
            >
              <X className="cart-close-icon" />
            </button>
          </div>

          <div className="cart-content">
            {state.items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-content">
                  <div className="cart-empty-icon-container">
                    <ShoppingCart className="cart-empty-icon" />
                  </div>
                  <h3 className="cart-empty-title">{t('cart.empty')}</h3>
                  <p className="cart-empty-description">{t('cart.empty.description')}</p>
                  <button
                    onClick={onClose}
                    className="cart-continue-shopping-button"
                  >
                    {t('cart.continue.shopping')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="cart-items-container">
                  <div className="cart-items">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="cart-item">
                        <div className="cart-item-content">
                          <div className="cart-item-image">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="cart-item-img"
                            />
                          </div>
                          
                          <div className="cart-item-details">
                            <h3 className="cart-item-name">{item.product.name}</h3>
                            <p className="cart-item-category">{item.product.category}</p>
                            <p className="cart-item-price">{formatPrice(item.product.price)}</p>
                          </div>
                        </div>
                        
                        <div className="cart-item-actions">
                          <div className="cart-item-quantity">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="cart-quantity-button"
                            >
                              <Minus className="cart-quantity-icon" />
                            </button>
                            
                            <span className="cart-quantity-display">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="cart-quantity-button"
                            >
                              <Plus className="cart-quantity-icon" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="cart-remove-button"
                          >
                            <Trash2 className="cart-remove-icon" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Section - Always visible */}
                <div className="cart-footer">
                  <div className="cart-footer-content">
                    <div className="cart-total">
                      <span className="cart-total-label">{t('cart.total')}:</span>
                      <span className="cart-total-amount">
                        {formatPrice(state.total)}
                      </span>
                    </div>
                    
                    <div className="cart-delivery-info">
                      <div className="cart-delivery-content">
                        <span>✓ {t('cart.free.delivery')}</span>
                        <span className="cart-delivery-separator">•</span>
                        <span>✓ {t('cart.payment.delivery')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutClick}
                      className="cart-checkout-button"
                    >
                      {t('cart.order')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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