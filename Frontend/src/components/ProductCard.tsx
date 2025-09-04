import React, { useState } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';

const ProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}> = ({ product, onViewDetails, viewMode = 'grid' }) => {
  const { dispatch } = useCart();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
    
    // Add visual feedback
    const button = e.currentTarget as HTMLElement;
    button.classList.add('animate-pulse');
    setTimeout(() => button.classList.remove('animate-pulse'), 200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        onClick={() => onViewDetails(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={imageError ? '/api/placeholder/300/200' : product.images[0]}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            {product.warranty && (
              <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm sm:text-xs font-medium">
                Garantie {product.warranty}
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-xl sm:text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-base sm:text-sm font-medium whitespace-nowrap ml-4">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 text-base sm:text-sm mb-4 line-clamp-2">{product.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-3xl sm:text-2xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product);
                  }}
                  className="flex items-center justify-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-base sm:text-sm"
                >
                  <Eye className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                  Détails
                </button>
              {t('products.details')}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-base sm:text-sm"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                  Ajouter
                </button>
              {t('products.add')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onClick={() => onViewDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 w-full h-64 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={imageError ? '/api/placeholder/300/300' : product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        </div>
        
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {product.warranty && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm sm:text-xs font-medium shadow-lg">
            {t('products.warranty')} {product.warranty}
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      <div className="p-6 sm:p-5">
        <div className="mb-3">
          <h3 className="font-bold text-2xl sm:text-lg text-gray-800 mb-2 line-clamp-2 sm:line-clamp-1">{product.name}</h3>
          <span className="bg-blue-50 text-blue-700 px-4 py-2 sm:px-3 sm:py-1 rounded-full text-lg sm:text-sm font-medium">
            {product.category}
          </span>
        </div>

        <div className="text-4xl sm:text-2xl font-bold text-blue-600 mb-6 sm:mb-4">
          {formatPrice(product.price)}
        </div>

        <div className="flex space-x-3 sm:space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex-1 flex items-center justify-center px-4 py-4 sm:px-3 sm:py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-lg sm:text-sm"
          >
            <Eye className="h-6 w-6 sm:h-4 sm:w-4 mr-2" />
            {t('products.details')}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center px-4 py-4 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-lg sm:text-sm"
          >
            <ShoppingCart className="h-6 w-6 sm:h-4 sm:w-4 mr-2" />
            {t('products.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;