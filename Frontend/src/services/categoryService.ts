import { api } from './api';
import { Category } from '../types';

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async (): Promise<Category[]> => {
    return await api.get('/categories');
  },

  // Récupérer une catégorie par ID
  getCategoryById: async (id: string): Promise<Category> => {
    return await api.get(`/categories/${id}`);
  },

  // Admin: Créer une nouvelle catégorie
  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    return await api.post('/categories', category);
  },

  // Admin: Mettre à jour une catégorie
  updateCategory: async (id: string, category: Partial<Category>): Promise<Category> => {
    return await api.put(`/categories/${id}`, category);
  },

  // Admin: Supprimer une catégorie
  deleteCategory: async (id: string): Promise<void> => {
    return await api.delete(`/categories/${id}`);
  },
};