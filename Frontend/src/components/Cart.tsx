import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
// Make sure these imports match your file structure
import CheckoutForm from './CheckoutForm';
import OrderConfirmation from './OrderConfirmation';

const Cart: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
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
      alert('Votre panier est vide');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
        <div className="bg-white h-full w-full sm:max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 sm:px-6 py-8 sm:py-6 flex items-center justify-between z-10">
            <h2 className="text-3xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="h-8 w-8 sm:h-6 sm:w-6 mr-4 sm:mr-3 text-blue-600" />
              Panier ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="p-4 sm:p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
            >
              <X className="h-7 w-7 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          <div className="flex flex-col h-full">
            {state.items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 sm:p-6">
                <div className="text-center">
                  <div className="w-32 h-32 sm:w-24 sm:h-24 mx-auto mb-8 sm:mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-14 w-14 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl sm:text-xl font-bold text-gray-800 mb-4 sm:mb-3">Votre panier est vide</h3>
                  <p className="text-lg sm:text-base text-gray-500 mb-8 sm:mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
                  <button
                    onClick={onClose}
                    className="bg-blue-600 text-white px-8 py-4 sm:px-6 sm:py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg sm:text-base"
                  >
                    Continuer les achats
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-6 pb-6 sm:pb-4">
                  <div className="space-y-6 sm:space-y-4">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="bg-gray-50 rounded-2xl p-6 sm:p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-5 sm:space-x-4">
                          <div className="w-20 h-20 sm:w-16 sm:h-16 bg-white rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg sm:text-base text-gray-800 line-clamp-2 sm:truncate">{item.product.name}</h3>
                            <p className="text-base sm:text-sm text-gray-600 mt-1">{item.product.category}</p>
                            <p className="text-xl sm:text-lg font-bold text-blue-600 mt-2 sm:mt-1">{formatPrice(item.product.price)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 sm:mt-4">
                          <div className="flex items-center space-x-4 sm:space-x-3 bg-white rounded-xl border border-gray-200 p-2 sm:p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-3 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
                            </button>
                            
                            <span className="w-10 sm:w-8 text-center font-bold text-lg sm:text-base">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-3 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-3 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-6 w-6 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Section - Always visible */}
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-8 sm:p-6 mb-24 sm:mb-20">
                  <div className="space-y-6 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl sm:text-xl font-bold">Total:</span>
                      <span className="text-4xl sm:text-3xl font-black text-blue-600">
                        {formatPrice(state.total)}
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 sm:p-4 rounded-xl border border-green-200">
                      <div className="flex flex-col sm:flex-row items-center justify-center text-base sm:text-sm text-green-700 space-y-2 sm:space-y-0 sm:space-x-4">
                        <span>✓ Livraison gratuite</span>
                        <span className="hidden sm:inline">•</span>
                        <span>✓ Paiement à la livraison</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 sm:py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold text-xl sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Passer la commande
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