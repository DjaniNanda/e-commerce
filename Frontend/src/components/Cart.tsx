import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
// Make sure these imports match your file structure
import CheckoutForm from './CheckoutForm';
import OrderConfirmation from './OrderConfirmation';

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end overflow-hidden">
        <div className="bg-white h-full w-full sm:max-w-lg lg:max-w-xl overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-between z-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 lg:mr-4 text-blue-600" />
              {t('cart.title')} ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="p-3 sm:p-4 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all duration-200 group"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          <div className="flex flex-col h-full">
            {state.items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="text-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-gray-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{t('cart.empty')}</h3>
                  <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8">{t('cart.empty.description')}</p>
                  <button
                    onClick={onClose}
                    className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg"
                  >
                    {t('cart.continue.shopping')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-4 sm:pb-6">
                  <div className="space-y-4 sm:space-y-6">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-800 line-clamp-2">{item.product.name}</h3>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">{item.product.category}</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">{formatPrice(item.product.price)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 p-1 sm:p-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 sm:p-3 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            
                            <span className="w-8 sm:w-10 text-center font-bold text-base sm:text-lg lg:text-xl">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 sm:p-3 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Section - Always visible */}
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl sm:text-2xl font-bold">{t('cart.total')}:</span>
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600">
                        {formatPrice(state.total)}
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                      <div className="flex flex-col sm:flex-row items-center justify-center text-sm sm:text-base lg:text-lg text-green-700 space-y-2 sm:space-y-0 sm:space-x-4">
                        <span>✓ {t('cart.free.delivery')}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>✓ {t('cart.payment.delivery')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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