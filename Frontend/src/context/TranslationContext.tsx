import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the translation keys type
type TranslationKey = 
  | 'header.search.placeholder'
  | 'header.search.button'
  | 'header.categories'
  | 'header.delivery'
  | 'header.hours'
  | 'header.tagline'
  | 'header.stock'
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.description'
  | 'hero.stock'
  | 'hero.delivery'
  | 'hero.quality'
  | 'hero.service'
  | 'products.found'
  | 'products.found.plural'
  | 'products.search'
  | 'products.category'
  | 'products.clear.filters'
  | 'products.view'
  | 'products.details'
  | 'products.add'
  | 'products.warranty'
  | 'products.none.found'
  | 'products.none.description'
  | 'products.view.all'
  | 'products.ready.search'
  | 'products.ready.description'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.empty.description'
  | 'cart.continue.shopping'
  | 'cart.total'
  | 'cart.free.delivery'
  | 'cart.payment.delivery'
  | 'cart.order'
  | 'checkout.title'
  | 'checkout.subtitle'
  | 'checkout.personal.info'
  | 'checkout.first.name'
  | 'checkout.last.name'
  | 'checkout.phone'
  | 'checkout.delivery.address'
  | 'checkout.city'
  | 'checkout.quarter'
  | 'checkout.exact.location'
  | 'checkout.order.summary'
  | 'checkout.payment.method'
  | 'checkout.cash.delivery'
  | 'checkout.free.delivery.yaounde'
  | 'checkout.shipping.cameroon'
  | 'checkout.secure.order'
  | 'checkout.confirm'
  | 'checkout.terms'
  | 'footer.excellence'
  | 'footer.description'
  | 'footer.contact'
  | 'footer.hours'
  | 'footer.monday.friday'
  | 'footer.saturday'
  | 'footer.sunday'
  | 'footer.rights'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.support'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'
  | 'common.remove'
  | 'common.quantity'
  | 'common.price'
  | 'common.total'
  | 'common.name'
  | 'common.description'
  | 'common.category';

interface TranslationContextType {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: TranslationKey) => string;
}

// Keep your existing translations for UI elements
const translations: Record<'fr' | 'en', Record<TranslationKey, string>> = {
  fr: {
    // Header
    'header.search.placeholder': 'Rechercher des pièces automobiles...',
    'header.search.button': 'Rechercher',
    'header.categories': 'Catégories',
    'header.delivery': 'LIVRAISON GRATUITE - YAOUNDÉ',
    'header.hours': 'Lun-Dim: 8h30 - 22h30',
    'header.tagline': 'Pièces automobiles de qualité premium',
    'header.stock': 'En stock - Livraison rapide',
    
    // Hero Section
    'hero.title': 'Pièces Automobiles',
    'hero.subtitle': 'de Qualité Premium',
    'hero.description': 'Livraison gratuite à Yaoundé • Paiement à la livraison • Garantie assurée',
    'hero.stock': 'Stock permanent',
    'hero.delivery': 'Livraison rapide',
    'hero.quality': 'Qualité garantie',
    'hero.service': 'Service 7j/7',
    
    // Products
    'products.found': 'produit trouvé',
    'products.found.plural': 'produits trouvés',
    'products.search': 'Recherche',
    'products.category': 'Catégorie',
    'products.clear.filters': 'Effacer filtres',
    'products.view': 'Vue',
    'products.details': 'Détails',
    'products.add': 'Ajouter',
    'products.warranty': 'Garantie',
    'products.none.found': 'Aucun produit trouvé',
    'products.none.description': 'Nous n\'avons pas trouvé de produits correspondant à vos critères. Essayez de modifier votre recherche ou parcourir nos catégories.',
    'products.view.all': 'Voir tous les produits',
    'products.ready.search': 'Prêt à rechercher ?',
    'products.ready.description': 'Utilisez la barre de recherche ci-dessus ou sélectionnez une catégorie pour commencer.',
    
    // Cart
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.empty.description': 'Découvrez nos produits et ajoutez-les à votre panier',
    'cart.continue.shopping': 'Continuer les achats',
    'cart.total': 'Total',
    'cart.free.delivery': 'Livraison gratuite',
    'cart.payment.delivery': 'Paiement à la livraison',
    'cart.order': 'Passer la commande',
    
    // Checkout
    'checkout.title': 'Finaliser la commande',
    'checkout.subtitle': 'Complétez vos informations pour procéder',
    'checkout.personal.info': 'Informations personnelles',
    'checkout.first.name': 'Prénom',
    'checkout.last.name': 'Nom',
    'checkout.phone': 'Numéro de téléphone',
    'checkout.delivery.address': 'Adresse de livraison',
    'checkout.city': 'Ville',
    'checkout.quarter': 'Quartier',
    'checkout.exact.location': 'Lieux Exact',
    'checkout.order.summary': 'Résumé de la commande',
    'checkout.payment.method': 'Mode de paiement',
    'checkout.cash.delivery': 'Paiement à la livraison (Cash)',
    'checkout.free.delivery.yaounde': 'Livraison gratuite à Yaoundé',
    'checkout.shipping.cameroon': 'Expédition dans tout le Cameroun',
    'checkout.secure.order': 'Commande sécurisée',
    'checkout.confirm': 'Confirmer la commande',
    'checkout.terms': 'En confirmant, vous acceptez nos conditions de vente',
    
    // Footer
    'footer.excellence': 'Excellence automobile',
    'footer.description': 'Votre partenaire de confiance pour toutes vos pièces automobiles au Cameroun. Nous nous engageons à fournir des produits de qualité premium avec un service exceptionnel.',
    'footer.contact': 'Contact',
    'footer.hours': 'Horaires',
    'footer.monday.friday': 'Lun - Ven',
    'footer.saturday': 'Samedi',
    'footer.sunday': 'Dimanche',
    'footer.rights': 'Tous droits réservés',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.support': 'Support',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.remove': 'Supprimer',
    'common.quantity': 'Quantité',
    'common.price': 'Prix',
    'common.total': 'Total',
    'common.name': 'Nom',
    'common.description': 'Description',
    'common.category': 'Catégorie',
  },
  en: {
    // Header
    'header.search.placeholder': 'Search for auto parts...',
    'header.search.button': 'Search',
    'header.categories': 'Categories',
    'header.delivery': 'FREE DELIVERY - YAOUNDÉ',
    'header.hours': 'Mon-Sun: 8:30 AM - 10:30 PM',
    'header.tagline': 'Premium quality auto parts',
    'header.stock': 'In stock - Fast delivery',
    
    // Hero Section
    'hero.title': 'Automotive Parts',
    'hero.subtitle': 'Premium Quality',
    'hero.description': 'Free delivery in Yaoundé • Cash on delivery • Guaranteed warranty',
    'hero.stock': 'Permanent stock',
    'hero.delivery': 'Fast delivery',
    'hero.quality': 'Guaranteed quality',
    'hero.service': '7/7 service',
    
    // Products
    'products.found': 'product found',
    'products.found.plural': 'products found',
    'products.search': 'Search',
    'products.category': 'Category',
    'products.clear.filters': 'Clear filters',
    'products.view': 'View',
    'products.details': 'Details',
    'products.add': 'Add',
    'products.warranty': 'Warranty',
    'products.none.found': 'No products found',
    'products.none.description': 'We couldn\'t find any products matching your criteria. Try modifying your search or browse our categories.',
    'products.view.all': 'View all products',
    'products.ready.search': 'Ready to search?',
    'products.ready.description': 'Use the search bar above or select a category to get started.',
    
    // Cart
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.empty.description': 'Discover our products and add them to your cart',
    'cart.continue.shopping': 'Continue shopping',
    'cart.total': 'Total',
    'cart.free.delivery': 'Free delivery',
    'cart.payment.delivery': 'Cash on delivery',
    'cart.order': 'Place order',
    
    // Checkout
    'checkout.title': 'Complete order',
    'checkout.subtitle': 'Fill in your information to proceed',
    'checkout.personal.info': 'Personal information',
    'checkout.first.name': 'First name',
    'checkout.last.name': 'Last name',
    'checkout.phone': 'Phone number',
    'checkout.delivery.address': 'Delivery address',
    'checkout.city': 'City',
    'checkout.quarter': 'Quarter',
    'checkout.exact.location': 'Exact location',
    'checkout.order.summary': 'Order summary',
    'checkout.payment.method': 'Payment method',
    'checkout.cash.delivery': 'Cash on delivery',
    'checkout.free.delivery.yaounde': 'Free delivery in Yaoundé',
    'checkout.shipping.cameroon': 'Shipping throughout Cameroon',
    'checkout.secure.order': 'Secure order',
    'checkout.confirm': 'Confirm order',
    'checkout.terms': 'By confirming, you accept our terms of sale',
    
    // Footer
    'footer.excellence': 'Automotive excellence',
    'footer.description': 'Your trusted partner for all your automotive parts in Cameroon. We are committed to providing premium quality products with exceptional service.',
    'footer.contact': 'Contact',
    'footer.hours': 'Hours',
    'footer.monday.friday': 'Mon - Fri',
    'footer.saturday': 'Saturday',
    'footer.sunday': 'Sunday',
    'footer.rights': 'All rights reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.support': 'Support',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.quantity': 'Quantity',
    'common.price': 'Price',
    'common.total': 'Total',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.category': 'Category',
  }
};

// Google Translate integration
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'fr' | 'en'>('fr');

  // Initialize Google Translate
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
    };

    const initializeGoogleTranslate = () => {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };
    };

    initializeGoogleTranslate();
    addGoogleTranslateScript();
  }, []);

  const setLanguage = (lang: 'fr' | 'en') => {
    setLanguageState(lang);
    
    // Trigger Google Translate
    setTimeout(() => {
      const googleTranslateSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
      if (googleTranslateSelect) {
        googleTranslateSelect.value = lang === 'en' ? 'en' : 'fr';
        googleTranslateSelect.dispatchEvent(new Event('change'));
      }
    }, 100);
  };

  const t = (key: TranslationKey): string => {
    // Return French by default - Google Translate will handle the translation
    // This way your backend data will also be translated
    return translations['fr'][key] || key;
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
      <TranslationContext.Provider value={{ language, setLanguage, t }}>
        {children}
      </TranslationContext.Provider>
    </>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};