import React, { useState } from 'react';
import { X, MapPin, Phone, User, CreditCard, Package, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import '../components styles/CheckoutForm.css';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { state } = useCart();
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
      newErrors.firstName = 'Prénom requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Téléphone invalide';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adresse requise';
    }

    if (!formData.quarter.trim()) {
      newErrors.quarter = 'Quartier requis';
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
    <div className="checkout-overlay">
      <div className="checkout-modal">
        {/* Header */}
        <div className="checkout-header">
          <div>
            <h2 className="checkout-title">Finaliser ma commande</h2>
            <p className="checkout-subtitle">Remplissez vos informations de livraison</p>
          </div>
          <button
            onClick={onClose}
            className="close-button"
          >
            <X className="close-icon" />
          </button>
        </div>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-grid">
              {/* Left Column - Forms */}
              <div className="form-sections">
                {/* Customer Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <div className="section-icon section-icon-blue">
                      <User className="icon" />
                    </div>
                    Informations personnelles
                  </h3>
                  
                  <div className="input-grid">
                    <div className="input-group">
                      <label className="input-label">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                        placeholder="Votre prénom"
                      />
                      {errors.firstName && (
                        <p className="error-message">
                          <span className="error-dot"></span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                        placeholder="Votre nom"
                      />
                      {errors.lastName && (
                        <p className="error-message">
                          <span className="error-dot"></span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="phone-input-group">
                    <label className="input-label-with-icon">
                      <Phone className="label-icon" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                      placeholder="Ex: +237 6XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="error-message">
                        <span className="error-dot"></span>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="form-section">
                  <h3 className="section-title">
                    <div className="section-icon section-icon-green">
                      <MapPin className="icon" />
                    </div>
                    Adresse de livraison
                  </h3>

                  <div className="input-grid address-grid">
                    <div className="input-group">
                      <label className="input-label">
                        Ville *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        {cameroonCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">
                        Quartier *
                      </label>
                      <input
                        type="text"
                        name="quarter"
                        value={formData.quarter}
                        onChange={handleInputChange}
                        className={`form-input ${errors.quarter ? 'form-input-error' : ''}`}
                        placeholder="Votre quartier"
                      />
                      {errors.quarter && (
                        <p className="error-message">
                          <span className="error-dot"></span>
                          {errors.quarter}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      Localisation exacte *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-input ${errors.address ? 'form-input-error' : ''}`}
                      placeholder="Rue, numéro, point de repère..."
                    />
                    {errors.address && (
                      <p className="error-message">
                        <span className="error-dot"></span>
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="sidebar">
                {/* Order Summary */}
                <div className="order-summary">
                  <div className="order-summary-header">
                    <h3 className="order-summary-title">
                      <Package className="order-icon" />
                      Résumé de la commande
                    </h3>
                  </div>
                  
                  <div className="order-summary-content">
                    <div className="order-items">
                      {state.items.map((item) => (
                        <div key={item.product.id} className="order-item">
                          <div className="order-item-details">
                            <p className="order-item-name">{item.product.name}</p>
                            <p className="order-item-quantity">Quantité: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            <p className="order-item-total">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-total">
                      <div className="order-total-row">
                        <span className="order-total-label">Total:</span>
                        <span className="order-total-amount">{formatPrice(state.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="payment-info">
                  <h4 className="payment-title">
                    <CreditCard className="payment-icon" />
                    Mode de paiement
                  </h4>
                  <div className="payment-options">
                    <div className="payment-option">
                      <div className="payment-dot payment-dot-blue"></div>
                      <span>Paiement à la livraison</span>
                    </div>
                    <div className="payment-option">
                      <div className="payment-dot payment-dot-green"></div>
                      <span>Livraison gratuite à Yaoundé</span>
                    </div>
                    <div className="payment-option">
                      <div className="payment-dot payment-dot-orange"></div>
                      <span>Expédition dans tout le Cameroun</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="security-badge">
                  <div className="security-content">
                    <Shield className="security-icon" />
                    <span className="security-text">Commande sécurisée</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Shield className="submit-icon" />
                    Confirmer ma commande
                  </>
                )}
              </button>
              <p className="terms-text">
                En passant cette commande, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;