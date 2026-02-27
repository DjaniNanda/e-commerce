import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';

const CACHE_KEY = 'ab237_products_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  products: Product[];
  count: number;
  timestamp: number;
  sortBy: string;
}

const readCache = (sortBy: string): CacheEntry | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.sortBy !== sortBy) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry;
  } catch {
    return null;
  }
};

const writeCache = (products: Product[], count: number, sortBy: string) => {
  try {
    const entry: CacheEntry = { products, count, timestamp: Date.now(), sortBy };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* quota exceeded — ignore */ }
};

export const useProducts = () => {
  // Hydrate from cache immediately — zero-delay first paint
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = readCache('price_asc');
    return cached?.products ?? [];
  });
  const [productsCount, setProductsCount] = useState<number>(() => {
    const cached = readCache('price_asc');
    return cached?.count ?? 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products — shows cache instantly, then refreshes in background
  const loadProducts = async (sortBy: string = 'price_asc') => {
    const cached = readCache(sortBy);
    if (cached) {
      setProducts(cached.products);
      setProductsCount(cached.count);
      setLoading(false);
    }
    try {
      setLoading(true);
      const response = await productService.getAllProducts(sortBy);
      setProducts(response.products);
      setProductsCount(response.count);
      writeCache(response.products, response.count, sortBy);
      setError(null);
    } catch (err) {
      if (!cached) setError('Erreur lors du chargement des produits');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

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
        sortBy: filters.sortBy || 'price_asc',
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
    loadProducts,
  };
};