import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import './components styles/google-translate.css';

import MainApp from './components/MainApp';
import AdminPanel from './components/AdminPanel';
import ProductDetails from './components/admin/ProductDetails';
import OrderDetails from './components/admin/OrderDetails';
import ProductForm from './components/admin/ProductForm';

// Google Translate initialization
const initializeGoogleTranslate = () => {
  // Prevent multiple initializations
  if ((window as any).googleTranslateInitialized) {
    return;
  }
  
  (window as any).googleTranslateInitialized = true;
  
  // Initialize Google Translate
  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'fr',
        includedLanguages: 'fr,en',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        multilanguagePage: true,
        gaTrack: false // Disabled since you don't have Google Analytics
      },
      'google_translate_element'
    );
  };

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.onerror = () => {
    console.warn('Failed to load Google Translate');
  };
  document.head.appendChild(script);
};

function App() {
  useEffect(() => {
    // Wait for the app to fully load before initializing Google Translate
    const handleAppLoad = () => {
      // Add a small delay to ensure all React components are rendered
      setTimeout(() => {
        initializeGoogleTranslate();
      }, 500);
    };

    // Check if the window is already loaded
    if (document.readyState === 'complete') {
      handleAppLoad();
    } else {
      // Wait for all resources to load (images, stylesheets, etc.)
      window.addEventListener('load', handleAppLoad);
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener('load', handleAppLoad);
    };
  }, []);

  return (
    <CartProvider>
      <Router>
        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainApp />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/products/add" element={<ProductForm />} />
          <Route path="/admin/products/edit/:id" element={<ProductForm />} />
          <Route path="/admin/products/:id" element={<ProductDetails />} />
          <Route path="/admin/orders/:id" element={<OrderDetails />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;