import { api } from './api';
import { Product } from '../types';

// Define the response type for endpoints that return product lists with count
interface ProductResponse {
  products: Product[];
  count: number;
}

export const productService = {
  // Récupérer tous les produits
  getAllProducts: async (): Promise<ProductResponse> => {
    return await api.get('/products');
  },
  
  // Récupérer un produit par ID
  getProductById: async (id: string): Promise<Product> => {
    return await api.get(`/products/${id}`);
  },
  
  // Rechercher des produits
  searchProducts: async (query: string): Promise<ProductResponse> => {
    return await api.get(`/products/search?q=${encodeURIComponent(query)}`);
  },
  
  // Filtrer les produits par catégorie
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    return await api.get(`/products/category/${category}`);
  },
  
  // Filtrer les produits par prix
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    return await api.get(`/products/price?min=${minPrice}&max=${maxPrice}`);
  },
  
  // Filtrer les produits avec plusieurs critères
  filterProducts: async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.append('search', filters.search);
    
    return await api.get(`/products/filter?${params.toString()}`);
  },
  
  // Admin: Ajouter un produit
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return await api.post('/products', product);
  },
  
  // Admin: Mettre à jour un produit
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return await api.put(`/products/${id}`, product);
  },
  
  // Admin: Supprimer un produit
  deleteProduct: async (id: string): Promise<void> => {
    return await api.delete(`/products/${id}`);
  },
};