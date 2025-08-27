import React from 'react';
import { CheckCircle, Phone, MapPin, Package, Clock, Truck, CreditCard } from 'lucide-react';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ isOpen, onClose, orderData }) => {
  if (!isOpen || !orderData) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Commande confirmée !</h2>
          <p className="text-green-100 text-lg">
            Votre Commande • Enregistrée avec succès
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8">
            
            {/* Call Confirmation Alert */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">Confirmation par appel</h3>
                  <p className="text-blue-800">
                    Notre équipe vous contactera au numéro{' '}
                    <span className="font-semibold bg-blue-200 px-2 py-1 rounded">
                      {orderData.customerInfo.phone}
                    </span>{' '}
                    dans les prochaines minutes pour confirmer votre commande et les détails de livraison.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Order Details */}
              <div className="space-y-6">
                
                {/* Customer Info */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    Informations client
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">Nom:</span>
                      <span className="text-gray-800 font-semibold">
                        {orderData.customerInfo.firstName} {orderData.customerInfo.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">Téléphone:</span>
                      <span className="text-gray-800 font-semibold bg-gray-200 px-3 py-1 rounded-lg">
                        {orderData.customerInfo.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    Adresse de livraison
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 font-semibold mb-1">{orderData.customerInfo.address}</p>
                    <p className="text-gray-600">
                      {orderData.customerInfo.quarter}, {orderData.customerInfo.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                
                {/* Order Items */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800 text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Articles commandés
                    </h4>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {orderData.items.map((item: any) => (
                        <div key={item.product.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 leading-tight">{item.product.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-gray-800 text-lg">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-6">
                      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl">
                        <span className="text-xl font-bold text-gray-800">Total:</span>
                        <span className="text-3xl font-bold text-blue-600">{formatPrice(orderData.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Timeline */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 text-lg mb-6 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Prochaines étapes
              </h4>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-1">Enregistrée</h5>
                  <p className="text-xs text-gray-600">Commande reçue</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3 animate-pulse">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-1">Appel</h5>
                  <p className="text-xs text-gray-600">Confirmation en cours</p>
                </div>
                
                <div className="text-center opacity-75">
                  <div className="bg-orange-100 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                    <Truck className="h-8 w-8 text-orange-600" />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-1">Livraison</h5>
                  <p className="text-xs text-gray-600">24-48h à Yaoundé</p>
                </div>
                
                <div className="text-center opacity-75">
                  <div className="bg-purple-100 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-1">Paiement</h5>
                  <p className="text-xs text-gray-600">À la réception</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Restez disponible !</h4>
                  <p className="text-yellow-800">
                    Assurez-vous que votre téléphone soit accessible. Notre équipe vous appellera 
                    dans les <span className="font-semibold">15-30 prochaines minutes</span> pour 
                    confirmer les détails de votre commande et organiser la livraison.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-3">Besoin d'aide ?</h4>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant votre commande, contactez notre service client :
              </p>
              <div className="inline-flex items-center bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-bold text-blue-600 text-lg">+237 XXX XXX XXX</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center mb-4">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
              >
                <Package className="h-5 w-5 mr-3" />
                Continuer mes achats
              </button>
              
              <p className="text-gray-500 text-sm mt-4">
                Merci pour votre confiance ! 🙏
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;