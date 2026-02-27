import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

const CACHE_KEY = 'ab237_categories_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (categories change rarely)

const readCache = (): Category[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
};

const writeCache = (data: Category[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

export const useCategories = () => {
  // Hydrate from cache immediately
  const [categories, setCategories] = useState<Category[]>(() => readCache() ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    const cached = readCache();
    if (cached) {
      setCategories(cached);
      setLoading(false);
    }
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      writeCache(data);
      setError(null);
    } catch (err) {
      if (!cached) setError('Erreur lors du chargement des catégories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, fetchCategories };
};