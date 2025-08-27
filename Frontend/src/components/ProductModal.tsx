import React, { useState } from 'react';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const ProductModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { dispatch } = useCart();

  if (!isOpen) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-800">Détails du produit</h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
            >
              <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(95vh-100px)]">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Images Section */}
              <div>
                <div className="relative mb-6 group">
                  <div className="aspect-w-1 aspect-h-1 w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
                    <img
                      src={imageError ? '/api/placeholder/400/400' : product.images[currentImageIndex]}
                      alt={product.name}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{product.name}</h1>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
                        {product.subcategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <p className="text-blue-700 text-sm font-medium">Prix tout compris, livraison gratuite</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-semibold">
                    🛡️ Garantie {product.warranty}
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl font-semibold">
                    ⚡ En stock
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <ShoppingCart className="h-6 w-6 mr-3" />
                    Ajouter au panier
                  </button>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">🚛</span>
                      Livraison gratuite
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>✓ Livraison gratuite à Yaoundé</li>
                      <li>✓ Expédition dans tout le Cameroun</li>
                      <li>✓ Paiement à la livraison disponible</li>
                      <li>✓ Support client 7j/7</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default ProductModal;