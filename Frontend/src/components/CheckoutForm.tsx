import React, { useState } from 'react';
import { X, MapPin, Phone, User, CreditCard, Package, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { orderService } from '../services/orderService';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { state } = useCart();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Yaoundé',
    quarter: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('checkout.first.name') + ' requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('checkout.last.name') + ' requis';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.phone') + ' requis';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.phone)) {
      newErrors.phone = t('checkout.phone') + ' invalide';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adresse requise';
    }

    if (!formData.quarter.trim()) {
      newErrors.quarter = t('checkout.quarter') + ' requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      const orderData = {
        customerInfo: formData,
        items: state.items,
        total: state.total,
      };
      
      // Submit to backend
      orderService.createOrder(orderData)
        .then((createdOrder) => {
          onSubmit(createdOrder);
        })
        .catch((error) => {
          console.error('Error creating order:', error);
          // Still show confirmation even if backend fails
          onSubmit(orderData);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const cameroonCities = [
    'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 
    'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe', 'Buea'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden mx-2 sm:mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 sm:px-8 py-8 sm:py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-2xl font-bold text-white">{t('checkout.title')}</h2>
            <p className="text-blue-100 text-lg sm:text-sm mt-2 sm:mt-1">{t('checkout.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-4 sm:p-3 hover:bg-white/20 rounded-full transition-all duration-200 text-white hover:rotate-90"
          >
            <X className="h-7 w-7 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          <form onSubmit={handleSubmit} className="p-8 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-10 sm:space-y-8">
                {/* Customer Information */}
                <div className="bg-gray-50/50 rounded-xl p-8 sm:p-6 border border-gray-200">
                  <h3 className="text-2xl sm:text-xl font-semibold text-gray-800 mb-8 sm:mb-6 flex items-center">
                    <div className="bg-blue-100 p-3 sm:p-2 rounded-lg mr-4 sm:mr-3">
                      <User className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    {t('checkout.personal.info')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-6">
                    <div className="space-y-3 sm:space-y-2">
                      <label className="block text-lg sm:text-sm font-semibold text-gray-700">
                        {t('checkout.first.name')} *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        placeholder={t('checkout.first.name')}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-lg sm:text-sm flex items-center mt-2 sm:mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 sm:space-y-2">
                      <label className="block text-lg sm:text-sm font-semibold text-gray-700">
                        {t('checkout.last.name')} *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        placeholder={t('checkout.last.name')}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-lg sm:text-sm flex items-center mt-2 sm:mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 sm:mt-6 space-y-3 sm:space-y-2">
                    <label className="block text-lg sm:text-sm font-semibold text-gray-700 flex items-center">
                      <Phone className="h-5 w-5 sm:h-4 sm:w-4 mr-2 text-gray-500" />
                      {t('checkout.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="Ex: +237 6XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-lg sm:text-sm flex items-center mt-2 sm:mt-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50/50 rounded-xl p-8 sm:p-6 border border-gray-200">
                  <h3 className="text-2xl sm:text-xl font-semibold text-gray-800 mb-8 sm:mb-6 flex items-center">
                    <div className="bg-green-100 p-3 sm:p-2 rounded-lg mr-4 sm:mr-3">
                      <MapPin className="h-6 w-6 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    {t('checkout.delivery.address')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-6 mb-8 sm:mb-6">
                    <div className="space-y-3 sm:space-y-2">
                      <label className="block text-lg sm:text-sm font-semibold text-gray-700">
                        {t('checkout.city')} *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                      >
                        {cameroonCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 sm:space-y-2">
                      <label className="block text-lg sm:text-sm font-semibold text-gray-700">
                        {t('checkout.quarter')} *
                      </label>
                      <input
                        type="text"
                        name="quarter"
                        value={formData.quarter}
                        onChange={handleInputChange}
                        className={`w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          errors.quarter ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        placeholder={t('checkout.quarter')}
                      />
                      {errors.quarter && (
                        <p className="text-red-500 text-lg sm:text-sm flex items-center mt-2 sm:mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {errors.quarter}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-2">
                    <label className="block text-lg sm:text-sm font-semibold text-gray-700">
                      {t('checkout.exact.location')} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 sm:px-4 sm:py-3 text-xl sm:text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="Rue, numéro, point de repère..."
                    />
                    {errors.address && (
                      <p className="text-red-500 text-lg sm:text-sm flex items-center mt-2 sm:mt-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-8 sm:space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden sticky top-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 sm:px-6 py-5 sm:py-4 border-b border-gray-200">
                    <h3 className="text-xl sm:text-lg font-semibold text-gray-800 flex items-center">
                      <Package className="h-6 w-6 sm:h-5 sm:w-5 mr-3 sm:mr-2 text-gray-600" />
                      {t('checkout.order.summary')}
                    </h3>
                  </div>
                  
                  <div className="p-8 sm:p-6">
                    <div className="space-y-5 sm:space-y-4 mb-8 sm:mb-6">
                      {state.items.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-xl sm:text-base text-gray-800 leading-tight">{item.product.name}</p>
                            <p className="text-lg sm:text-sm text-gray-500 mt-2 sm:mt-1">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right ml-5 sm:ml-4">
                            <p className="font-semibold text-xl sm:text-base text-gray-800">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl sm:text-lg font-bold text-gray-800">{t('common.total')}:</span>
                        <span className="text-4xl sm:text-2xl font-bold text-blue-600">{formatPrice(state.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 sm:p-6 border border-blue-200">
                  <h4 className="font-semibold text-xl sm:text-base text-blue-900 mb-5 sm:mb-4 flex items-center">
                    <CreditCard className="h-6 w-6 sm:h-5 sm:w-5 mr-3 sm:mr-2" />
                    {t('checkout.payment.method')}
                  </h4>
                  <div className="space-y-4 sm:space-y-3 text-lg sm:text-sm">
                    <div className="flex items-center text-blue-800">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>{t('checkout.cash.delivery')}</span>
                    </div>
                    <div className="flex items-center text-blue-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>{t('checkout.free.delivery.yaounde')}</span>
                    </div>
                    <div className="flex items-center text-blue-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>{t('checkout.shipping.cameroon')}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 rounded-xl p-6 sm:p-4 border border-green-200">
                  <div className="flex items-center text-green-800">
                    <Shield className="h-6 w-6 sm:h-5 sm:w-5 mr-3 sm:mr-2" />
                    <span className="text-lg sm:text-sm font-medium">{t('checkout.secure.order')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 sm:mt-8 pt-8 sm:pt-6 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center text-2xl sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {isSubmitting ? (
                {t('common.cancel')}
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-4 sm:mr-3"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Shield className="h-6 w-6 sm:h-5 sm:w-5 mr-4 sm:mr-3" />
                    {t('checkout.confirm')}
                  </>
                )}
              </button>
              <p className="text-center text-lg sm:text-sm text-gray-500 mt-4 sm:mt-3">
                {t('checkout.terms')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;