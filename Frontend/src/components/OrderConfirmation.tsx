import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, Phone, MapPin, Package, Clock, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { generateWhatsAppMessage, getWhatsAppUrl } from '../utils/whatsappUtils';
import '../components styles/OrderConfirmation.css';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ isOpen, onClose, orderData }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(5);
  const [showWhatsAppAlert, setShowWhatsAppAlert] = useState(false);

  const whatsAppPhoneNumber = '237652010915';

  useEffect(() => {
    if (isOpen && orderData) {
      setShowWhatsAppAlert(true);
      setCountdown(5);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            const message = generateWhatsAppMessage(orderData);
            const whatsappUrl = getWhatsAppUrl(whatsAppPhoneNumber, message);
            window.open(whatsappUrl, '_blank');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isOpen, orderData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 400);

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

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleContinueClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleManualWhatsAppClick = useCallback(() => {
    if (orderData) {
      const message = generateWhatsAppMessage(orderData);
      const whatsappUrl = getWhatsAppUrl(whatsAppPhoneNumber, message);
      window.open(whatsappUrl, '_blank');
    }
  }, [orderData, whatsAppPhoneNumber]);

  if (!isOpen || !orderData) return null;

  return (
    <div className="order-confirmation-overlay" onClick={handleOverlayClick}>
      <div 
        ref={modalRef}
        className="order-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        
        {/* Success Header */}
        <header className="success-header">
          <div className="success-icon-container">
            <CheckCircle className="success-icon" aria-hidden="true" />
          </div>
          <h1 id="confirmation-title" className="success-title">Commande confirmée !</h1>
          <p id="confirmation-description" className="success-subtitle">
            Votre Commande • Enregistrée avec succès
          </p>
        </header>

        <div className="order-content">
          <div className="order-content-inner">

            {/* WhatsApp Redirect Alert */}
            {showWhatsAppAlert && countdown > 0 && (
              <section className="whatsapp-redirect-alert" role="region" aria-labelledby="whatsapp-alert-title" style={{
                backgroundColor: '#25D366',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MessageCircle size={32} aria-hidden="true" />
                    <h2 id="whatsapp-alert-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                      Redirection vers WhatsApp
                    </h2>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                    Vous allez être redirigé vers WhatsApp dans <strong style={{ fontSize: '1.5rem' }}>{countdown}</strong> seconde{countdown !== 1 ? 's' : ''}...
                  </p>
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                    Votre commande avec tous les détails et prix sera automatiquement envoyée
                  </p>
                </div>
              </section>
            )}

            {/* Call Confirmation Alert */}
            <section className="call-alert" role="region" aria-labelledby="call-alert-title">
              <div className="call-alert-content">
                <div className="call-alert-icon">
                  <Phone className="call-alert-icon-svg" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="call-alert-title" className="call-alert-title">Confirmation par appel</h2>
                  <p className="call-alert-text">
                    Notre équipe vous contactera au numéro{' '}
                    <span className="phone-highlight">
                      {orderData.customerInfo.phone}
                    </span>{' '}
                    dans les prochaines minutes pour confirmer votre commande et les détails de livraison.
                  </p>
                </div>
              </div>
            </section>

            <div className="order-grid">
              {/* Left Column - Order Details */}
              <div className="order-section">
                
                {/* Customer Info */}
                <section className="info-card" aria-labelledby="customer-info-title">
                  <h3 id="customer-info-title" className="info-card-header">
                    <div className="info-card-icon info-card-icon--blue">
                      <Phone aria-hidden="true" />
                    </div>
                    Informations client
                  </h3>
                  <div className="customer-info">
                    <div className="customer-info-row">
                      <span className="customer-info-label">Nom:</span>
                      <span className="customer-info-value">
                        {orderData.customerInfo.firstName} {orderData.customerInfo.lastName}
                      </span>
                    </div>
                    <div className="customer-info-row">
                      <span className="customer-info-label">Téléphone:</span>
                      <span className="customer-info-value customer-info-phone">
                        {orderData.customerInfo.phone}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Delivery Address */}
                <section className="info-card" aria-labelledby="address-title">
                  <h3 id="address-title" className="info-card-header">
                    <div className="info-card-icon info-card-icon--green">
                      <MapPin aria-hidden="true" />
                    </div>
                    Adresse de livraison
                  </h3>
                  <div className="address-card">
                    <p className="address-main">{orderData.customerInfo.address}</p>
                    <p className="address-details">
                      {orderData.customerInfo.quarter}, {orderData.customerInfo.city}
                    </p>
                  </div>
                </section>
              </div>

              {/* Right Column - Order Summary */}
              <div className="order-section">
                
                {/* Order Items */}
                <section className="order-summary" aria-labelledby="order-summary-title">
                  <header className="order-summary-header">
                    <h3 id="order-summary-title" className="order-summary-title">
                      <Package aria-hidden="true" />
                      Articles commandés
                    </h3>
                  </header>
                  <div className="order-summary-content">
                    <ul className="order-items" role="list">
                      {orderData.items.map((item: any) => (
                        <li key={item.product.id} className="order-item">
                          <div className="order-item-details">
                            <h4 className="order-item-name">{item.product.name}</h4>
                            <p className="order-item-quantity">Quantité: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            <p className="order-item-total">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="order-total">
                      <div className="order-total-row">
                        <span className="order-total-label">Total:</span>
                        <span 
                          className="order-total-amount"
                          aria-label={`Total de la commande: ${formatPrice(orderData.total)}`}
                        >
                          {formatPrice(orderData.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Process Timeline */}
            <section className="process-timeline" aria-labelledby="timeline-title">
              <h3 id="timeline-title" className="timeline-title">
                <Clock aria-hidden="true" />
                Prochaines étapes
              </h3>
              
              <div className="timeline-steps" role="list">
                <div className="timeline-step" role="listitem">
                  <div className="timeline-step-icon timeline-step-icon--completed">
                    <CheckCircle aria-hidden="true" />
                  </div>
                  <h4 className="timeline-step-title">Enregistrée</h4>
                  <p className="timeline-step-description">Commande reçue</p>
                </div>
                
                <div className="timeline-step" role="listitem">
                  <div className="timeline-step-icon timeline-step-icon--active">
                    <Phone aria-hidden="true" />
                  </div>
                  <h4 className="timeline-step-title">Appel</h4>
                  <p className="timeline-step-description">Confirmation en cours</p>
                </div>
                
                <div className="timeline-step" role="listitem">
                  <div className="timeline-step-icon timeline-step-icon--pending">
                    <Truck aria-hidden="true" />
                  </div>
                  <h4 className="timeline-step-title">Livraison</h4>
                  <p className="timeline-step-description">24-48h à Yaoundé</p>
                </div>
                
                <div className="timeline-step" role="listitem">
                  <div className="timeline-step-icon timeline-step-icon--future">
                    <CreditCard aria-hidden="true" />
                  </div>
                  <h4 className="timeline-step-title">Paiement</h4>
                  <p className="timeline-step-description">À la réception</p>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section className="important-notice" role="region" aria-labelledby="notice-title">
              <div className="notice-content">
                <div className="notice-icon">
                  <Phone aria-hidden="true" />
                </div>
                <div>
                  <h3 id="notice-title" className="notice-title">Restez disponible !</h3>
                  <p className="notice-text">
                    Assurez-vous que votre téléphone soit accessible. Notre équipe vous appellera 
                    dans les <span className="notice-highlight">15-30 prochaines minutes</span> pour 
                    confirmer les détails de votre commande et organiser la livraison.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="contact-info" aria-labelledby="contact-title">
              <h3 id="contact-title" className="contact-title">Besoin d'aide ?</h3>
              <p className="contact-description">
                Pour toute question concernant votre commande, contactez notre service client :
              </p>
              <div className="contact-phone">
                <Phone aria-hidden="true" />
                <a 
                  href="tel:+237699849474" 
                  className="contact-phone-number hover:text-blue-700 transition-colors"
                >
                  +237 699 849 474
                </a>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="action-section">
              <button
                onClick={handleManualWhatsAppClick}
                className="whatsapp-manual-button"
                type="button"
                style={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  marginBottom: '1rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#128C7E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                }}
              >
                <MessageCircle aria-hidden="true" />
                Ouvrir WhatsApp maintenant
              </button>

              <button
                ref={continueButtonRef}
                onClick={handleContinueClick}
                className="continue-button"
                type="button"
                aria-describedby="thank-you-text"
              >
                <Package aria-hidden="true" />
                Continuer mes achats
              </button>

              <p id="thank-you-text" className="thank-you-text">
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