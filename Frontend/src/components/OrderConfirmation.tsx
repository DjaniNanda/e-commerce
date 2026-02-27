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
  const whatsappButtonRef = useRef<HTMLButtonElement>(null);

  const whatsAppPhoneNumber = '237659230573';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        whatsappButtonRef.current?.focus();
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

  const handleWhatsAppClick = useCallback(() => {
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
          <h1 id="confirmation-title" className="success-title">Commande enregistrée !</h1>
          <p id="confirmation-description" className="success-subtitle">
            Cliquez sur le bouton ci-dessous pour valider votre commande via WhatsApp
          </p>
        </header>

        <div className="order-content">
          <div className="order-content-inner">

            {/* WhatsApp Validation Alert - Clickable */}
            <button
              onClick={handleWhatsAppClick}
              className="whatsapp-validation-alert"
              role="button"
              aria-labelledby="whatsapp-alert-title"
              type="button"
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(37, 211, 102, 0.2)',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#128C7E';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 211, 102, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#25D366';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 211, 102, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageCircle size={32} aria-hidden="true" />
                  <h2 id="whatsapp-alert-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    Validation requise sur WhatsApp
                  </h2>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                  Pour valider votre commande, vous devez <strong>envoyer les détails via WhatsApp</strong>.
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.95, lineHeight: '1.4' }}>
                  Votre commande sera confirmée uniquement après l'envoi du message WhatsApp avec tous les détails et prix.
                </p>
                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', fontWeight: '600', opacity: 1 }}>
                  👆 Cliquez ici pour ouvrir WhatsApp
                </p>
              </div>
            </button>

            {/* WhatsApp Action Button - Primary CTA */}
            <div style={{ marginBottom: '2rem' }}>
              <button
                ref={whatsappButtonRef}
                onClick={handleWhatsAppClick}
                className="whatsapp-primary-button"
                type="button"
                style={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: '1.25rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  transition: 'all 0.3s',
                  boxShadow: '0 10px 15px -3px rgba(37, 211, 102, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#128C7E';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37, 211, 102, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 211, 102, 0.3)';
                }}
              >
                <MessageCircle size={24} aria-hidden="true" />
                Valider ma commande sur WhatsApp
              </button>
            </div>

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
                  <p className="timeline-step-description">Commande créée</p>
                </div>
                
                <div className="timeline-step" role="listitem">
                  <div className="timeline-step-icon timeline-step-icon--active">
                    <MessageCircle aria-hidden="true" />
                  </div>
                  <h4 className="timeline-step-title">WhatsApp</h4>
                  <p className="timeline-step-description">Validation requise</p>
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
                  <MessageCircle aria-hidden="true" />
                </div>
                <div>
                  <h3 id="notice-title" className="notice-title">Action requise !</h3>
                  <p className="notice-text">
                    Votre commande n'est <span className="notice-highlight">pas encore validée</span>. 
                    Vous devez cliquer sur le bouton WhatsApp ci-dessus pour envoyer les détails de votre 
                    commande. Notre équipe confirmera ensuite votre commande et organisera la livraison.
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
                  href="tel:+237659230573" 
                  className="contact-phone-number hover:text-blue-700 transition-colors"
                >
                  +237 659 230 573
                </a>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="action-section">
              <button
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