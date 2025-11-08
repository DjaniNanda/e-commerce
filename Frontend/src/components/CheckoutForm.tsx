import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  
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
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first input after a short delay
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: 'Yaoundé',
        quarter: ''
      });
      setErrors({});
      setTouchedFields({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }, []);

  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'Prénom requis' : '';
      case 'lastName':
        return !value.trim() ? 'Nom requis' : '';
      case 'phone':
        if (!value.trim()) return 'Téléphone requis';
        if (!/^[0-9+\-\s()]{8,}$/.test(value)) return 'Téléphone invalide';
        return '';
      case 'address':
        return !value.trim() ? 'Adresse requise' : '';
      case 'quarter':
        return !value.trim() ? 'Quartier requis' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach(key => {
      if (key !== 'city') { // City always has a default value
        const error = validateField(key, formData[key as keyof typeof formData]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus first field with error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        errorElement?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerInfo: formData,
        items: state.items,
        total: state.total,
        timestamp: new Date().toISOString(),
      };
      
      // Submit to backend
      const createdOrder = await orderService.createOrder(orderData);
      onSubmit(createdOrder);
      
    } catch (error) {
      console.error('Error creating order:', error);
      // Still show confirmation even if backend fails
      onSubmit({
        customerInfo: formData,
        items: state.items,
        total: state.total,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, state.items, state.total, errors, validateForm, onSubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Validate field in real-time if it has been touched
    if (touchedFields[name] || errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touchedFields, errors, validateField]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched and validate
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const cameroonCities = [
    'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 
    'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe', 'Buea'
  ];

  return (
    <div className="checkout-overlay" onClick={handleOverlayClick}>
      <div className="checkout-modal">
        {/* Header */}
        <header className="checkout-header">
          <div>
            <h2 className="checkout-title">Finaliser ma commande</h2>
            <p className="checkout-subtitle">Remplissez vos informations de livraison</p>
          </div>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Fermer la fenêtre de commande"
            type="button"
          >
            <X className="close-icon" />
          </button>
        </header>

        <div className="checkout-content">
          <form ref={formRef} onSubmit={handleSubmit} className="checkout-form" noValidate>
            <div className="form-grid">
              {/* Left Column - Forms */}
              <div className="form-sections">
                {/* Customer Information */}
                <section className="form-section" aria-labelledby="customer-info-title">
                  <h3 id="customer-info-title" className="section-title">
                    <div className="section-icon section-icon-blue">
                      <User className="icon" />
                    </div>
                    Informations personnelles
                  </h3>
                  
                  <div className="input-grid">
                    <div className="input-group">
                      <label htmlFor="firstName" className="input-label">
                        Prénom *
                      </label>
                      <input
                        ref={firstInputRef}
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                        placeholder="Votre prénom"
                        autoComplete="given-name"
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        aria-invalid={!!errors.firstName}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="error-message" role="alert">
                          <span className="error-dot" aria-hidden="true"></span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="input-group">
                      <label htmlFor="lastName" className="input-label">
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                        placeholder="Votre nom"
                        autoComplete="family-name"
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        aria-invalid={!!errors.lastName}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="error-message" role="alert">
                          <span className="error-dot" aria-hidden="true"></span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="phone-input-group">
                    <label htmlFor="phone" className="input-label-with-icon">
                      <Phone className="label-icon" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                      placeholder="Ex: +237 6XX XXX XXX"
                      autoComplete="tel"
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="error-message" role="alert">
                        <span className="error-dot" aria-hidden="true"></span>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </section>

                {/* Delivery Address */}
                <section className="form-section" aria-labelledby="address-title">
                  <h3 id="address-title" className="section-title">
                    <div className="section-icon section-icon-green">
                      <MapPin className="icon" />
                    </div>
                    Adresse de livraison
                  </h3>

                  <div className="input-grid address-grid">
                    <div className="input-group">
                      <label htmlFor="city" className="input-label">
                        Ville *
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="form-select"
                        autoComplete="address-level2"
                      >
                        {cameroonCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label htmlFor="quarter" className="input-label">
                        Quartier *
                      </label>
                      <input
                        type="text"
                        id="quarter"
                        name="quarter"
                        value={formData.quarter}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`form-input ${errors.quarter ? 'form-input-error' : ''}`}
                        placeholder="Votre quartier"
                        autoComplete="address-level3"
                        aria-describedby={errors.quarter ? 'quarter-error' : undefined}
                        aria-invalid={!!errors.quarter}
                      />
                      {errors.quarter && (
                        <p id="quarter-error" className="error-message" role="alert">
                          <span className="error-dot" aria-hidden="true"></span>
                          {errors.quarter}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="address" className="input-label">
                      Localisation exacte *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`form-input ${errors.address ? 'form-input-error' : ''}`}
                      placeholder="Rue, numéro, point de repère..."
                      autoComplete="street-address"
                      aria-describedby={errors.address ? 'address-error' : undefined}
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && (
                      <p id="address-error" className="error-message" role="alert">
                        <span className="error-dot" aria-hidden="true"></span>
                        {errors.address}
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column - Order Summary */}
              <aside className="sidebar">
                {/* Order Summary */}
                <section className="order-summary" aria-labelledby="order-summary-title">
                  <header className="order-summary-header">
                    <h3 id="order-summary-title" className="order-summary-title">
                      <Package className="order-icon" />
                      Résumé de la commande
                    </h3>
                  </header>
                  
                  <div className="order-summary-content">
                    <div className="order-items">
                      {state.items.map((item) => (
                        <article key={item.product.id} className="order-item">
                          <div className="order-item-details">
                            <h4 className="order-item-name">{item.product.name}</h4>
                            <p className="order-item-quantity">Quantité: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            <p className="order-item-total">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                    
                    <div className="order-total">
                      <div className="order-total-row">
                        <span className="order-total-label">Total:</span>
                        <span className="order-total-amount" aria-label={`Total de la commande: ${formatPrice(state.total)}`}>
                          {formatPrice(state.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Payment Info */}
                <section className="payment-info" aria-labelledby="payment-title">
                  <h4 id="payment-title" className="payment-title">
                    <CreditCard className="payment-icon" />
                    Mode de paiement
                  </h4>
                  <ul className="payment-options" role="list">
                    <li className="payment-option">
                      <div className="payment-dot payment-dot-blue" aria-hidden="true"></div>
                      <span>Paiement à la livraison</span>
                    </li>
                    <li className="payment-option">
                      <div className="payment-dot payment-dot-green" aria-hidden="true"></div>
                      <span>Livraison gratuite à Yaoundé</span>
                    </li>
                    <li className="payment-option">
                      <div className="payment-dot payment-dot-orange" aria-hidden="true"></div>
                      <span>Expédition dans tout le Cameroun</span>
                    </li>
                  </ul>
                </section>

                {/* Security Badge */}
                <section className="security-badge">
                  <div className="security-content">
                    <Shield className="security-icon" aria-hidden="true" />
                    <span className="security-text">Commande sécurisée</span>
                  </div>
                </section>
              </aside>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
                aria-describedby="terms-text"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" aria-hidden="true"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Shield className="submit-icon" aria-hidden="true" />
                    <span>Confirmer votre commande</span>
                  </>
                )}
              </button>
              <p id="terms-text" className="terms-text">
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