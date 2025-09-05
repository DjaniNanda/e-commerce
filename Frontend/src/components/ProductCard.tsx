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
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden cursor-pointer transform hover:-translate-y-1 w-full"
        onClick={() => onViewDetails(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
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
          
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg sm:text-xl text-gray-800 line-clamp-2 sm:line-clamp-1 flex-1">{product.name}</h3>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ml-2 sm:ml-4 flex-shrink-0">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
              
              <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-600 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  {t('products.details')}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  {t('products.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden cursor-pointer transform hover:-translate-y-1 w-full"
      onClick={() => onViewDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
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

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-3">
          <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base lg:text-lg font-medium">
            {product.category}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-4 sm:mb-6">
          {formatPrice(product.price)}
        </div>

        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex-1 flex items-center justify-center px-3 py-3 sm:px-4 sm:py-4 lg:py-4 border-2 border-blue-600 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-sm sm:text-base lg:text-lg"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
            {t('products.details')}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center px-3 py-3 sm:px-4 sm:py-4 lg:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
            {t('products.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
