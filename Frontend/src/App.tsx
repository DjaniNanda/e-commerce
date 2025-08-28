import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainApp from './components/MainApp';
import AdminPanel from './components/AdminPanel';
import ProductDetails from './components/admin/ProductDetails';
import OrderDetails from './components/admin/OrderDetails';
import ProductForm from './components/admin/ProductForm';

function App() {
  return (
    <CartProvider>
      <Router>
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