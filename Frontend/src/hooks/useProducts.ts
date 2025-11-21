import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all products on initial mount with sorting
  const loadProducts = async (sortBy: string = 'price_asc') => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts(sortBy);
      setProducts(response.products);
      setProductsCount(response.count);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search products with sorting
  const searchProducts = async (query: string, sortBy: string = 'price_asc') => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(query.trim(), sortBy);
      setProducts(response.products);
      setProductsCount(response.count);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products with sorting
  const filterProducts = async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
  }) => {
    try {
      setLoading(true);
      const response = await productService.filterProducts({
        ...filters,
        sortBy: filters.sortBy || 'price_asc'
      });
      setProducts(response.products);
      setProductsCount(response.count);
      setError(null);
    } catch (err) {
      setError('Erreur lors du filtrage');
      console.error('Error filtering products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    productsCount,
    loading,
    error,
    searchProducts,
    filterProducts,
    loadProducts, // In case you want to refresh the data
  };
};