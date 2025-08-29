import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all products on initial mount
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
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

  // Search products
  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(query);
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

  // Filter products
  const filterProducts = async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const response = await productService.filterProducts(filters);
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

  // Get products by category
  const getProductsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const products = await productService.getProductsByCategory(category);
      setProducts(products);
      setProductsCount(products.length);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des produits par catégorie');
      console.error('Error loading products by category:', err);
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
    getProductsByCategory,
    loadProducts, // In case you want to refresh the data
  };
};