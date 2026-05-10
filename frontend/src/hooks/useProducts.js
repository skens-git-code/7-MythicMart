/* Custom hook to fetch products from API with static fallback */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import staticProducts from '../data/products';
import { normalizeProduct } from '../utils/assets';

const CACHE_TTL_MS = 60_000;
const productCache = new Map();

export const useProducts = (category = 'all', sort = 'newest', search = '') => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    const cacheKey = JSON.stringify({ category, sort, search });
    const cached = productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setProducts(cached.products);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);

      const response = await api.get(`/products?${params.toString()}`);
      
      const formatted = response.data.map(normalizeProduct);
      productCache.set(cacheKey, { products: formatted, timestamp: Date.now() });
      setProducts(formatted);
    } catch (err) {
      /* Fallback to static data */
      let filtered = [...staticProducts];
      if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q)
        );
      }
      const formatted = filtered.map(normalizeProduct);
      setProducts(formatted);
      setError(err.error || err.message || 'API unavailable');
    } finally {
      setLoading(false);
    }
  }, [category, sort, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
