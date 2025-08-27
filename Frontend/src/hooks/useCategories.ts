import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error('Error fetching categories:', err);
      // Fallback vers les catégories locales en cas d'erreur
      const { categories: localCategories } = await import('../data/categories');
      setCategories(localCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};