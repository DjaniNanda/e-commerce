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
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(script);

  // Initialize Google Translate
  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'fr',
        includedLanguages: 'fr,en',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        multilanguagePage: true,
        gaTrack: true,
        gaId: 'UA-XXXXX-X' // Replace with your Google Analytics ID if you have one
      },
      'google_translate_element'
    );
  };
};

function App() {
  useEffect(() => {
    // Initialize Google Translate when app loads
    initializeGoogleTranslate();
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